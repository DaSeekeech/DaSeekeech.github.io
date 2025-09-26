// === УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ - ПОЛНАЯ ВЕРСИЯ ===

class UIManager {
    constructor() {
        this.isDarkTheme = true;
        this.isPreviewMode = false;
        this.tipsVisible = false;
        this.isMobile = window.innerWidth <= 768;
        
        this.initializeTheme();
        this.setupMobileDetection();
        this.setupGlobalEventListeners();
    }

    setupMobileDetection() {
        // Определение мобильного устройства при загрузке и изменении размера
        const checkMobile = () => {
            this.isMobile = window.innerWidth <= 768;
            this.handleMobileLayout();
        };

        window.addEventListener('resize', checkMobile);
        checkMobile(); // Initial check
    }

    handleMobileLayout() {
        const appContainer = document.querySelector('.app-container');
        if (!appContainer) return;

        if (this.isMobile) {
            appContainer.classList.add('mobile-view');
            this.setupMobileMenu();
            this.adaptUIForMobile();
        } else {
            appContainer.classList.remove('mobile-view');
            this.removeMobileMenu();
            this.adaptUIForDesktop();
        }
    }

    setupMobileMenu() {
        // Не создавать меню, если оно уже существует
        if (document.getElementById('mobileMenu')) return;

        const mobileMenu = document.createElement('div');
        mobileMenu.id = 'mobileMenu';
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `
            <button class="mobile-btn" data-action="open" title="Открыть файл">📁</button>
            <button class="mobile-btn" data-action="save" title="Сохранить файл">💾</button>
            <button class="mobile-btn" data-action="theme" title="Сменить тему">🌙</button>
            <button class="mobile-btn" data-action="help" title="Помощь">ℹ️</button>
            <button class="mobile-btn" data-action="preview" title="Превью">👁️</button>
        `;

        // Вставляем меню перед status-bar
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            statusBar.parentNode.insertBefore(mobileMenu, statusBar);
        } else {
            document.querySelector('.app-container').appendChild(mobileMenu);
        }

        // Обработчики для мобильных кнопок
        mobileMenu.querySelectorAll('.mobile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleMobileAction(action);
            });
        });
    }

    removeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.remove();
        }
    }

    adaptUIForMobile() {
        // Скрываем некоторые элементы на мобильных
        const toolbar = document.querySelector('.toolbar');
        if (toolbar) {
            toolbar.style.display = 'none';
        }

        // Увеличиваем область редактирования
        const editor = document.getElementById('textEditor');
        if (editor) {
            editor.style.fontSize = '16px'; // Улучшает читаемость на мобильных
            editor.style.minHeight = '50vh';
        }
    }

    adaptUIForDesktop() {
        // Восстанавливаем скрытые элементы
        const toolbar = document.querySelector('.toolbar');
        if (toolbar) {
            toolbar.style.display = 'flex';
        }

        const editor = document.getElementById('textEditor');
        if (editor) {
            editor.style.fontSize = '14px';
            editor.style.minHeight = 'auto';
        }
    }

    handleMobileAction(action) {
        switch(action) {
            case 'open':
                document.getElementById('fileInput').click();
                break;
            case 'save':
                if (window.textEditorInstance) {
                    window.textEditorInstance.saveCurrentFile();
                }
                break;
            case 'theme':
                this.toggleTheme();
                break;
            case 'help':
                const currentFormat = window.textEditorInstance?.currentFormat || 'plain';
                this.showTips(currentFormat);
                break;
            case 'preview':
                const previewToggle = document.getElementById('previewToggle');
                if (previewToggle) {
                    previewToggle.checked = !previewToggle.checked;
                    this.togglePreview();
                }
                break;
        }
    }

    setupGlobalEventListeners() {
        // Закрытие подсказок по клику вне области
        document.addEventListener('click', (e) => {
            const tipsPanel = document.getElementById('tipsPanel');
            const formatHelp = document.getElementById('formatHelp');
            
            if (this.tipsVisible && tipsPanel && 
                !tipsPanel.contains(e.target) && 
                e.target !== formatHelp &&
                !formatHelp?.contains(e.target)) {
                this.hideTips();
            }
        });

        // Закрытие подсказок по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.tipsVisible) {
                this.hideTips();
            }
        });
    }

    initializeTheme() {
        this.loadPreferences();
        this.applyTheme();
    }

    applyTheme() {
        const themeLink = document.querySelector('link[href*="themes/"]');
        if (themeLink) {
            themeLink.href = this.isDarkTheme ? 
                'styles/themes/dark.css' : 
                'styles/themes/light.css';
        }
        
        this.updateThemeButton();
        this.updateSyntaxHighlighting();
        
        // Применяем тему ко всему документу
        document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
    }

    updateThemeButton() {
        const themeButton = document.getElementById('themeToggle');
        if (themeButton) {
            themeButton.textContent = this.isDarkTheme ? '🌙 Тёмная' : '☀️ Светлая';
            themeButton.title = this.isDarkTheme ? 'Переключить на светлую тему' : 'Переключить на темную тему';
            
            // Обновляем мобильную кнопку темы
            const mobileThemeBtn = document.querySelector('.mobile-btn[data-action="theme"]');
            if (mobileThemeBtn) {
                mobileThemeBtn.textContent = this.isDarkTheme ? '🌙' : '☀️';
                mobileThemeBtn.title = this.isDarkTheme ? 'Светлая тема' : 'Тёмная тема';
            }
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.applyTheme();
        this.savePreferences();
    }

    updateSyntaxHighlighting() {
        // Обновляем тему highlight.js при смене темы приложения
        if (typeof hljs !== 'undefined') {
            const link = document.querySelector('link[href*="highlight.js"]');
            if (link) {
                const newTheme = this.isDarkTheme ? 
                    'github-dark.min.css' : 
                    'github.min.css';
                link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${newTheme}`;
            }
            
            // Переприменяем подсветку ко всем блокам кода
            setTimeout(() => {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }, 150);
        }
    }

    togglePreview() {
        this.isPreviewMode = !this.isPreviewMode;
        const editorPanel = document.getElementById('editorPanel');
        const previewPanel = document.getElementById('previewPanel');
        const previewToggle = document.getElementById('previewToggle');
        
        if (this.isPreviewMode) {
            editorPanel.classList.add('hidden');
            previewPanel.classList.remove('hidden');
            if (previewToggle) previewToggle.checked = true;
            this.updatePreview();
            
            // Обновляем мобильную кнопку превью
            const mobilePreviewBtn = document.querySelector('.mobile-btn[data-action="preview"]');
            if (mobilePreviewBtn) {
                mobilePreviewBtn.textContent = '✏️';
                mobilePreviewBtn.title = 'Редактор';
            }
        } else {
            editorPanel.classList.remove('hidden');
            previewPanel.classList.add('hidden');
            if (previewToggle) previewToggle.checked = false;
            
            // Обновляем мобильную кнопку превью
            const mobilePreviewBtn = document.querySelector('.mobile-btn[data-action="preview"]');
            if (mobilePreviewBtn) {
                mobilePreviewBtn.textContent = '👁️';
                mobilePreviewBtn.title = 'Превью';
            }
        }
        
        this.savePreferences();
    }

    updatePreview() {
        if (window.textEditorInstance && typeof window.textEditorInstance.updatePreview === 'function') {
            window.textEditorInstance.updatePreview();
        }
    }

    showTips(format) {
        this.tipsVisible = true;
        const tipsPanel = document.getElementById('tipsPanel');
        const tipsContent = document.getElementById('tipsContent');
        
        if (!tipsPanel || !tipsContent) return;
        
        const formatTips = new FormatTips();
        tipsContent.innerHTML = formatTips.renderTips(format);
        tipsPanel.classList.remove('hidden');
        tipsPanel.classList.add('fade-in');
        
        // Добавляем overlay для мобильных
        if (this.isMobile) {
            this.createOverlay();
        }
    }

    hideTips() {
        this.tipsVisible = false;
        const tipsPanel = document.getElementById('tipsPanel');
        if (tipsPanel) {
            tipsPanel.classList.add('hidden');
            tipsPanel.classList.remove('fade-in');
        }
        
        // Удаляем overlay
        this.removeOverlay();
    }

    createOverlay() {
        if (document.getElementById('tipsOverlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'tipsOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        `;
        overlay.addEventListener('click', () => this.hideTips());
        document.body.appendChild(overlay);
    }

    removeOverlay() {
        const overlay = document.getElementById('tipsOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    updateStatus(text, type = 'info') {
        const statusElement = document.getElementById('fileStatus');
        if (statusElement) {
            statusElement.textContent = text;
            statusElement.className = `file-status status-${type}`;
            
            // Автоматическое скрытие успешных статусов через 5 секунд
            if (type === 'success') {
                setTimeout(() => {
                    if (statusElement.textContent === text) {
                        statusElement.textContent = 'Готов к работе';
                        statusElement.className = 'file-status status-info';
                    }
                }, 5000);
            }
            
            // Для ошибок показываем дольше
            if (type === 'error') {
                setTimeout(() => {
                    if (statusElement.textContent === text) {
                        statusElement.textContent = 'Готов к работе';
                        statusElement.className = 'file-status status-info';
                    }
                }, 10000);
            }
        }
    }

    updateCounters(text) {
        const charCount = document.getElementById('charCount');
        const lineCount = document.getElementById('lineCount');
        
        if (charCount && lineCount) {
            const lines = text.split('\n');
            const charCountValue = text.length;
            const lineCountValue = lines.length;
            
            charCount.textContent = `${charCountValue.toLocaleString()} символов`;
            lineCount.textContent = `${lineCountValue} строк`;
            
            // Подсчет слов (дополнительная информация)
            const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
            charCount.title = `${wordCount.toLocaleString()} слов`;
            lineCount.title = `Последняя строка: ${lines[lines.length - 1]?.length || 0} символов`;
            
            // Визуальная индикация для больших файлов
            if (charCountValue > 10000) {
                charCount.style.color = 'var(--warning-color)';
            } else {
                charCount.style.color = '';
            }
        }
    }

    savePreferences() {
        const preferences = {
            theme: this.isDarkTheme ? 'dark' : 'light',
            preview: this.isPreviewMode,
            lastFormat: document.getElementById('formatSelector')?.value || 'plain',
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('seekeechEditorPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Не удалось сохранить настройки:', error);
        }
    }

    loadPreferences() {
        try {
            const saved = localStorage.getItem('seekeechEditorPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.isDarkTheme = preferences.theme === 'dark';
                this.isPreviewMode = preferences.preview || false;
                
                // Восстановление формата
                const formatSelector = document.getElementById('formatSelector');
                if (formatSelector && preferences.lastFormat) {
                    formatSelector.value = preferences.lastFormat;
                }
                
                console.log('Настройки загружены:', preferences);
            }
        } catch (error) {
            console.warn('Ошибка загрузки настроек:', error);
            // Устанавливаем значения по умолчанию при ошибке
            this.isDarkTheme = true;
            this.isPreviewMode = false;
        }
    }

    showError(message, details = '') {
        console.error('Ошибка редактора:', message, details);
        this.updateStatus(`Ошибка: ${message}`, 'error');
        
        // Показать подробности в консоли для разработчика
        if (details && console.error) {
            console.error('Детали ошибки:', details);
        }
        
        // Визуальное уведомление для пользователя
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Создаем уведомление, если его нет
        let notification = document.getElementById('globalNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'globalNotification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem;
                border-radius: 4px;
                z-index: 10000;
                max-width: 300px;
                word-wrap: break-word;
                animation: slideInRight 0.3s ease;
            `;
            document.body.appendChild(notification);
        }
        
        // Устанавливаем стили в зависимости от типа
        const typeStyles = {
            error: 'background: var(--error-color); color: white;',
            success: 'background: var(--success-color); color: white;',
            warning: 'background: var(--warning-color); color: black;',
            info: 'background: var(--accent-color); color: white;'
        };
        
        notification.style.cssText += typeStyles[type] || typeStyles.info;
        notification.textContent = message;
        notification.classList.add('fade-in');
        
        // Автоматическое скрытие
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('fade-in');
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    // Метод для показа загрузки
    showLoading(message = 'Загрузка...') {
        this.updateStatus(message, 'info');
        
        // Можно добавить спиннер или индикатор прогресса
        const statusElement = document.getElementById('fileStatus');
        if (statusElement) {
            statusElement.innerHTML = `⏳ ${message}`;
        }
    }

    // Метод для скрытия загрузки
    hideLoading() {
        const statusElement = document.getElementById('fileStatus');
        if (statusElement && statusElement.innerHTML.includes('⏳')) {
            statusElement.textContent = 'Готов к работе';
            statusElement.className = 'file-status status-info';
        }
    }
}

// Добавляем CSS для статусов и анимаций
const style = document.createElement('style');
style.textContent = `
    .status-success { color: var(--success-color) !important; }
    .status-error { color: var(--error-color) !important; }
    .status-warning { color: var(--warning-color) !important; }
    .status-info { color: var(--text-secondary) !important; }
    
    .mobile-menu {
        display: flex;
        justify-content: space-around;
        padding: 0.5rem;
        background: var(--bg-tertiary);
        border-top: 1px solid var(--border-color);
        position: sticky;
        bottom: 0;
        z-index: 100;
    }
    
    .mobile-btn {
        padding: 0.8rem;
        font-size: 1.2rem;
        background: none;
        border: none;
        cursor: pointer;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .mobile-btn:hover {
        background: var(--border-color);
    }
    
    .mobile-btn:active {
        transform: scale(0.95);
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .fade-out {
        animation: fadeOut 0.3s ease;
    }
    
    .mobile-view .toolbar {
        display: none !important;
    }
    
    /* Улучшенный скролл для мобильных */
    @media (max-width: 768px) {
        .editor-panel, .preview-panel {
            -webkit-overflow-scrolling: touch;
        }
    }
`;
document.head.appendChild(style);

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
          }
