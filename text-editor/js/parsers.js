// === УЛУЧШЕННЫЙ ПАРСЕР С ОБРАБОТКОЙ ОШИБОК ===

class FormatParser {
    constructor() {
        this.parsers = {
            plain: this.parsePlain,
            markdown: this.parseMarkdown,
            html: this.parseHTML,
            css: this.parseCSS,
            javascript: this.parseJavaScript,
            json: this.parseJSON,
            xml: this.parseXML,
            csv: this.parseCSV
        };
    }

    parsePlain(text) {
        return `<pre class="plain-text">${this.escapeHtml(text)}</pre>`;
    }

    parseMarkdown(text) {
        try {
            // Настройки marked для безопасного парсинга
            marked.setOptions({
                breaks: true,
                gfm: true,
                sanitize: false
            });
            return marked.parse(text);
        } catch (error) {
            return this.getErrorHTML('Markdown', error);
        }
    }

    parseHTML(text) {
        try {
            // Безопасный preview HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            
            // Удаляем потенциально опасные теги
            const scripts = tempDiv.querySelectorAll('script, style, link, meta');
            scripts.forEach(el => el.remove());
            
            return `<div class="code-block html-preview">${tempDiv.innerHTML}</div>`;
        } catch (error) {
            return this.getErrorHTML('HTML', error);
        }
    }

    parseCSS(text) {
        try {
            const highlighted = hljs.highlight('css', text).value;
            return `<pre><code class="hljs language-css">${highlighted}</code></pre>`;
        } catch (error) {
            return this.getErrorHTML('CSS', error);
        }
    }

    parseJavaScript(text) {
        try {
            const highlighted = hljs.highlight('javascript', text).value;
            return `<pre><code class="hljs language-javascript">${highlighted}</code></pre>`;
        } catch (error) {
            return this.getErrorHTML('JavaScript', error);
        }
    }

    parseJSON(text) {
        try {
            if (!text.trim()) return '<pre class="empty-json">{} // Пустой JSON</pre>';
            
            const parsed = JSON.parse(text);
            const formatted = JSON.stringify(parsed, null, 2);
            const highlighted = hljs.highlight('json', formatted).value;
            return `<pre><code class="hljs language-json">${highlighted}</code></pre>`;
        } catch (error) {
            // Возвращаем оригинальный текст с подсветкой ошибки
            const safeText = this.escapeHtml(text);
            return `
                <div class="json-error">
                    <div class="error-header">❌ Ошибка парсинга JSON:</div>
                    <div class="error-message">${error.message}</div>
                    <pre class="original-json">${safeText}</pre>
                </div>
            `;
        }
    }

    parseXML(text) {
        try {
            const highlighted = hljs.highlight('xml', text).value;
            return `<pre><code class="hljs language-xml">${highlighted}</code></pre>`;
        } catch (error) {
            return this.getErrorHTML('XML', error);
        }
    }

    parseCSV(text) {
        try {
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length === 0) return '<div class="empty-csv">Нет данных CSV</div>';
            
            let html = '<table class="csv-table">';
            lines.forEach((line, index) => {
                html += '<tr>';
                const cells = line.split(',').map(cell => this.escapeHtml(cell.trim()));
                cells.forEach(cell => {
                    const cellClass = index === 0 ? 'header-cell' : 'data-cell';
                    html += `<td class="${cellClass}">${cell}</td>`;
                });
                html += '</tr>';
            });
            html += '</table>';
            return html;
        } catch (error) {
            return this.getErrorHTML('CSV', error);
        }
    }

    getErrorHTML(format, error) {
        return `
            <div class="parse-error">
                <div class="error-icon">⚠️</div>
                <div class="error-content">
                    <h4>Ошибка парсинга ${format}</h4>
                    <p>${this.escapeHtml(error.message)}</p>
                    <small>Отображается как обычный текст</small>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    parse(format, text) {
        try {
            const parser = this.parsers[format] || this.parsePlain;
            return parser.call(this, text);
        } catch (error) {
            return this.getErrorHTML(format, error);
        }
    }
    }
