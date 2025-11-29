import puppeteer, { Page, Browser } from 'puppeteer';

/**
 * Interface que define a estrutura de dados extraídos do site.
 */
export interface ScrapedData {
    url: string;
    title: string;
    metaDescription: string;
    metaKeywords: string;
    ogTags: Record<string, string>;
    headings: {
        h1: string[];
        h2: string[];
        h3: string[];
        h4: string[];
        h5: string[];
        h6: string[];
    };
    links: {
        internal: string[];
        external: string[];
        total: number;
    };
    images: {
        total: number;
        withoutAlt: number;
        details: { src: string; alt: string }[];
    };
    scripts: {
        analytics: boolean;
        gtm: boolean;
        pixel: boolean;
        detected: string[];
    };
    content: {
        visibleText: string;
        htmlLength: number;
    };
    screenshot: string; // Base64 da imagem
}

/**
 * Função principal para realizar o scraping de uma URL.
 * Utiliza o Puppeteer para renderizar a página e extrair informações detalhadas.
 *
 * @param url A URL do site a ser analisado.
 * @returns Um objeto ScrapedData com todas as informações coletadas.
 */
export async function scrapeSite(url: string): Promise<ScrapedData> {
    console.log(`🔍 Iniciando scraping para: ${url}`);

    let browser: Browser | null = null;

    try {
        // Inicia o browser em modo headless (sem interface gráfica)
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessário para alguns ambientes serverless/container
        });

        const page: Page = await browser.newPage();

        // Define o viewport para simular um desktop padrão
        await page.setViewport({ width: 1920, height: 1080 });

        // Navega para a URL e aguarda o carregamento da rede (networkidle0 = sem conexões ativas por 500ms)
        // Timeout de 30 segundos para evitar travamentos
        console.log('⏳ Navegando e aguardando carregamento...');
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        console.log('📄 Extraindo dados da página...');

        // Extração de dados via execução de script no contexto da página
        const data = await page.evaluate(() => {
            // Helper para pegar texto de meta tags
            const getMetaContent = (name: string) => {
                const element = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
                return element ? element.getAttribute('content') || '' : '';
            };

            // 1. Meta Tags Básicas
            const title = document.title;
            const metaDescription = getMetaContent('description');
            const metaKeywords = getMetaContent('keywords');

            // 2. Open Graph Tags
            const ogTags: Record<string, string> = {};
            document.querySelectorAll('meta[property^="og:"]').forEach((tag) => {
                const property = tag.getAttribute('property');
                const content = tag.getAttribute('content');
                if (property && content) {
                    ogTags[property] = content;
                }
            });

            // 3. Headings (H1-H6)
            const headings: any = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
                document.querySelectorAll(tag).forEach((el) => {
                    if (el.textContent) headings[tag].push(el.textContent.trim());
                });
            });

            // 4. Links (Internos vs Externos)
            const links = Array.from(document.querySelectorAll('a'));
            const internalLinks: string[] = [];
            const externalLinks: string[] = [];

            links.forEach((link) => {
                if (link.href) {
                    try {
                        const linkUrl = new URL(link.href);
                        if (linkUrl.hostname === window.location.hostname) {
                            internalLinks.push(link.href);
                        } else {
                            externalLinks.push(link.href);
                        }
                    } catch (e) {
                        // Ignora links inválidos
                    }
                }
            });

            // 5. Imagens e Alt Text
            const images = Array.from(document.querySelectorAll('img'));
            const imagesDetails = images.map((img) => ({
                src: img.src,
                alt: img.alt || '',
            }));
            const imagesWithoutAlt = images.filter((img) => !img.alt || img.alt.trim() === '').length;

            // 6. Scripts de Analytics/Marketing
            const scripts = Array.from(document.querySelectorAll('script'));
            const scriptContents = scripts.map(s => s.src + (s.textContent || '')).join(' ');

            const hasAnalytics = /google-analytics\.com|ga\.js|gtag/.test(scriptContents);
            const hasGTM = /googletagmanager\.com\/gtm\.js/.test(scriptContents);
            const hasPixel = /connect\.facebook\.net\/.*\/fbevents\.js/.test(scriptContents);

            const detectedScripts = [];
            if (hasAnalytics) detectedScripts.push('Google Analytics');
            if (hasGTM) detectedScripts.push('Google Tag Manager');
            if (hasPixel) detectedScripts.push('Meta Pixel');

            // 7. Conteúdo Visível
            const visibleText = document.body.innerText;

            return {
                title,
                metaDescription,
                metaKeywords,
                ogTags,
                headings,
                links: {
                    internal: internalLinks,
                    external: externalLinks,
                    total: links.length,
                },
                images: {
                    total: images.length,
                    withoutAlt: imagesWithoutAlt,
                    details: imagesDetails,
                },
                scripts: {
                    analytics: hasAnalytics,
                    gtm: hasGTM,
                    pixel: hasPixel,
                    detected: detectedScripts,
                },
                content: {
                    visibleText,
                    htmlLength: document.documentElement.outerHTML.length,
                },
            };
        });

        console.log('📸 Gerando screenshot...');
        // Captura screenshot em base64 (encoding: 'base64')
        const screenshotBuffer = await page.screenshot({ encoding: 'base64', fullPage: false });
        const screenshot = `data:image/png;base64,${screenshotBuffer}`;

        console.log('✅ Scraping concluído com sucesso!');

        return {
            url,
            ...data,
            screenshot,
        };

    } catch (error: any) {
        console.error('❌ Erro durante o scraping:', error);
        throw new Error(`Falha ao analisar o site ${url}: ${error.message}`);
    } finally {
        if (browser) {
            console.log('🔒 Fechando navegador...');
            await browser.close();
        }
    }
}
