// === ГЛАВНЫЙ КОД РЕДАКТОРА ===

class TextEditor {
    constructor() {
        this.parser = new FormatParser();
        this.fileHandler = new FileHandler();
        this.ui = new UIManager();
        this.currentFormat = 'plain';
        
        this.initializeEventListeners();
        this.ui.loadPreferences();
    }

    initializeEventListeners() {
        // Открытие файла
        document.getElementById('openFile').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileOpen(e.target.files[0]);
        });

        // Сохранение файла
        document.getElementById('saveFile').addEventListener('click', () => {
            this.saveCurrentFile();
        });

        // Переключение формата
        document.getElementById('formatSelector').addEventListener('change', (e) => {
            this.currentFormat = e.target.value;
            this.updatePreview();
            this.updateFormatDisplay();
        });

        // Переключение превью
        document.getElementById('previewToggle').addEventListener('change', () => {
            this.ui.togglePreview();
            this.updatePreview();
        });

        // Подсказки
        document.getElementById('formatHelp').addEventListener('click', () => {
            this.ui.showTips(this.currentFormat);
        });

        document.getElementById('closeTips').addEventListener('click', () => {
            this.ui.hideTips();
        });

        // Ввод текста
        document.getElementById('textEditor').addEventListener('input', (e) => {
            this.handleTextInput(e.target.value);
        });

        // Переключение темы
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.ui.toggleTheme();
        });

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentFile();
                        break;
                    case 'o':
                        e.preventDefault();
                        document.getElementById('fileInput').click();
                        break;
                    case 'p':
                        e.preventDefault();
                        document.getElementById('previewToggle').click();
                        break;
                }
            }
        });
    }

    async handleFileOpen(file) {
        if (!file) return;

        try {
            const content = await this.fileHandler.openFile(file);
            document.getElementById('textEditor').value = content;
            
            this.currentFormat = this.fileHandler.detectFormat(file.name);
            document.getElementById('formatSelector').value = this.currentFormat;
            
            this.ui.updateStatus(`Файл "${file.name}" загружен`, 'success');
            this.ui.updateCounters(content);
            this.updatePreview();
            this.updateFormatDisplay();
        } catch (error) {
            this.ui.updateStatus(`Ошибка: ${error.message}`, 'error');
        }
    }

    handleTextInput(text) {
        this.fileHandler.currentContent = text;
        this.ui.updateCounters(text);
        this.updatePreview();
    }

    updatePreview() {
        if (!this.ui.isPreviewMode) return;

        const text = document.getElementById('textEditor').value;
        const previewContent = document.getElementById('previewContent');
        
        try {
            const parsed = this.parser.parse(this.currentFormat, text);
            previewContent.innerHTML = parsed;
            
            // Подсветка синтаксиса для code blocks
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        } catch (error) {
            previewContent.innerHTML = `<div class="error">Ошибка рендеринга: ${error.message}</div>`;
        }
    }

    saveCurrentFile() {
        const content = document.getElementById('textEditor').value;
        const fileInfo = this.fileHandler.getFileInfo();
        
        this.fileHandler.saveFile(content, fileInfo.name, this.currentFormat);
        this.ui.updateStatus(`Файл сохранен как ${fileInfo.name}`, 'success');
    }

    updateFormatDisplay() {
        const formatNames = {
            plain: 'Обычный текст',
            markdown: 'Markdown',
            html: 'HTML',
            css: 'CSS',
            javascript: 'JavaScript',
            json: 'JSON',
            xml: 'XML',
            csv: 'CSV'
        };
        
        document.getElementById('currentFormat').textContent = 
            `Формат: ${formatNames[this.currentFormat]}`;
    }
}

// Инициализация редактора при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new TextEditor();
    console.log('⟨🆔⟩ Seekeech Editor v3.0 инициализирован');
});
