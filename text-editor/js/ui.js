// === УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ - ИСПРАВЛЕННАЯ ВЕРСИЯ ===

class UIManager {
    constructor() {
        this.isDarkTheme = true;
        this.isPreviewMode = false;
        this.tipsVisible = false;
        this.isMobile = window.innerWidth <= 768;
        
        console.log('⟨UI⟩ Инициализация менеджера интерфейса');
        this.initializeTheme();
        this.setupMobileDetection();
        this.setupGlobalEventListeners();
    }

    setupMobileDetection() {
        const checkMobile = () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                console.log(`⟨UI⟩ Изменение режима: ${this.isMobile ? 'мобильный' : 'десктоп'}`);
                this.handleMobileLayout();
            }
        };

        window.addEventListener('resize', checkMobile);
        checkMobile();
    }

    handleMobileLayout() {
        const appContainer = document.querySelector('.app-container');
        if (!appContainer) {
            console.error('⟨UI⟩ Не найден app-container');
            return;
        }

        if (this.isMobile) {
            appContainer.classList.add('mobile-view');
            this.setupMobileMenu();
            this.adaptUIForMobile();
            console.log('⟨UI⟩ Мобильный интерфейс активирован');
        } else {
            appContainer.classList.remove('mobile-view');
            this.removeMobileMenu();
            this.adaptUIForDesktop();
            console.log('⟨UI⟩ Десктопный интерфейс активирован');
        }
    }

    setupMobileMenu() {
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

        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            statusBar.parentNode.insertBefore(mobileMenu, statusBar);
        } else {
            document.querySelector('.app-container').appendChild(mobileMenu);
        }

        mobileMenu.querySelectorAll('.mobile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleMobileAction(action);
            });
        });
        
        console.log('⟨UI⟩ Мобильное меню создано');
    }

    removeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.remove();
            console.log('⟨UI⟩ Мобильное меню удалено');
        }
    }

    adaptUIForMobile() {
        const toolbar = document.querySelector('.toolbar');
        const editor = document.getElementById('textEditor');
        
        if (toolbar) toolbar.style.display = 'none';
        if (editor) {
            editor.style.fontSize = '16px';
            editor.style.minHeight = '50vh';
        }
    }

    adaptUIForDesktop() {
        const toolbar = document.querySelector('.toolbar');
        const editor = document.getElementById('textEditor');
        
        if (toolbar) toolbar.style.display = 'flex';
        if (editor) {
            editor.style.fontSize = '14px';
            editor.style.minHeight = 'auto';
        }
    }

    handleMobileAction(action) {
        console.log(`⟨UI⟩ Мобильное действие: ${action}`);
        
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
                this.togglePreview();
                break;
        }
    }

    setupGlobalEventListeners() {
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

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.tipsVisible) {
                this.hideTips();
            }
        });
    }

    initializeTheme() {
        console.log('⟨UI⟩ Инициализация темы');
        this.loadPreferences();
        this.applyTheme();
    }

    applyTheme() {
        console.log(`⟨UI⟩ Применение темы: ${this.isDarkTheme ? 'темная' : 'светлая'}`);
        
        // Создаем элемент темы если его нет
        let themeLink = document.querySelector('link[data-theme]');
        if (!themeLink) {
            themeLink = document.createElement('link');
            themeLink.rel = 'stylesheet';
            themeLink.setAttribute('data-theme', 'true');
            document.head.appendChild(themeLink);
            console.log('⟨UI⟩ Создан новый элемент темы');
        }

        const themeFile = this.isDarkTheme ? 'styles/themes/dark.css' : 'styles/themes/light.css';
        themeLink.href = themeFile;
        
        // Добавляем временную метку для избежания кэширования
        themeLink.href += `?t=${Date.now()}`;
        
        console.log(`⟨UI⟩ Установлена тема: ${themeFile}`);

        // Ждем загрузки CSS перед обновлением интерфейса
        themeLink.onload = () => {
            console.log('⟨UI⟩ Тема загружена, обновление интерфейса');
            this.updateThemeButton();
            this.updateSyntaxHighlighting();
            this.applyThemeToBody();
        };

        themeLink.onerror = () => {
            console.error('⟨UI⟩ Ошибка загрузки темы');
            this.showError('Ошибка загрузки темы', 'Проверьте наличие CSS файлов');
        };
    }

    applyThemeToBody() {
        document.body.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
        document.body.style.backgroundColor = 'var(--bg-primary)';
        document.body.style.color = 'var(--text-primary)';
        
        // Принудительно обновляем стили всех элементов
        this.forceStyleUpdate();
    }

    forceStyleUpdate() {
        // Принудительное обновление стилей для всех основных элементов
        const elementsToUpdate = [
            '.editor-header', '.toolbar', '.editor-container', 
            '.status-bar', '.btn-primary', '.btn-secondary'
        ];
        
        elementsToUpdate.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'block';
                setTimeout(() => {
                    el.style.display = '';
                }, 10);
            });
        });
    }

    updateThemeButton() {
        const themeButton = document.getElementById('themeToggle');
        if (themeButton) {
            const newText = this.isDarkTheme ? '☀️ Светлая' : '🌙 Тёмная';
            const newTitle = this.isDarkTheme ? 'Переключить на светлую тему' : 'Переключить на темную тему';
            
            themeButton.textContent = newText;
            themeButton.title = newTitle;
            
            console.log(`⟨UI⟩ Кнопка темы обновлена: ${newText}`);
        }

        const mobileThemeBtn = document.querySelector('.mobile-btn[data-action="theme"]');
        if (mobileThemeBtn) {
            mobileThemeBtn.textContent = this.isDarkTheme ? '🌙' : '☀️';
            mobileThemeBtn.title = this.isDarkTheme ? 'Светлая тема' : 'Тёмная тема';
        }
    }

    toggleTheme() {
        console.log('⟨UI⟩ Переключение темы');
        this.isDarkTheme = !this.isDarkTheme;
        this.applyTheme();
        this.savePreferences();
        this.showNotification(`Тема изменена на ${this.isDarkTheme ? 'тёмную' : 'светлую'}`, 'success');
    }

    updateSyntaxHighlighting() {
        if (typeof hljs !== 'undefined') {
            console.log('⟨UI⟩ Обновление подсветки синтаксиса');
            
            const newTheme = this.isDarkTheme ? 'github-dark' : 'github';
            const highlightLink = document.querySelector('link[href*="highlight.js"]');
            
            if (highlightLink) {
                highlightLink.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${newTheme}.min.css`;
                
                highlightLink.onload = () => {
                    setTimeout(() => {
                        document.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightElement(block);
                        });
                        console.log('⟨UI⟩ Подсветка синтаксиса обновлена');
                    }, 100);
                };
            }
        }
    }

    togglePreview() {
        this.isPreviewMode = !this.isPreviewMode;
        const editorPanel = document.getElementById('editorPanel');
        const previewPanel = document.getElementById('previewPanel');
        const previewToggle = document.getElementById('previewToggle');
        
        console.log(`⟨UI⟩ Переключение превью: ${this.isPreviewMode ? 'вкл' : 'выкл'}`);

        if (this.isPreviewMode) {
            editorPanel.classList.add('hidden');
            previewPanel.classList.remove('hidden');
            if (previewToggle) previewToggle.checked = true;
            this.updatePreview();
            
            const mobilePreviewBtn = document.querySelector('.mobile-btn[data-action="preview"]');
            if (mobilePreviewBtn) {
                mobilePreviewBtn.textContent = '✏️';
                mobilePreviewBtn.title = 'Редактор';
            }
        } else {
            editorPanel.classList.remove('hidden');
            previewPanel.classList.add('hidden');
            if (previewToggle) previewToggle.checked = false;
            
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
        console.log(`⟨UI⟩ Показ подсказок для формата: ${format}`);
        
        this.tipsVisible = true;
        const tipsPanel = document.getElementById('tipsPanel');
        const tipsContent = document.getElementById('tipsContent');
        
        if (!tipsPanel || !tipsContent) {
            console.error('⟨UI⟩ Не найдены элементы подсказок');
            return;
        }
        
        const formatTips = new FormatTips();
        tipsContent.innerHTML = formatTips.renderTips(format);
        tipsPanel.classList.remove('hidden');
        tipsPanel.classList.add('fade-in');
        
        if (this.isMobile) {
            this.createOverlay();
        }
    }

    hideTips() {
        console.log('⟨UI⟩ Скрытие подсказок');
        this.tipsVisible = false;
        const tipsPanel = document.getElementById('tipsPanel');
        if (tipsPanel) {
            tipsPanel.classList.add('hidden');
            tipsPanel.classList.remove('fade-in');
        }
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
            
            console.log(`⟨UI⟩ Статус обновлен: ${text} (${type})`);

            if (type === 'success') {
                setTimeout(() => {
                    if (statusElement.textContent === text) {
                        statusElement.textContent = 'Готов к работе';
                        statusElement.className = 'file-status status-info';
                    }
                }, 5000);
            }

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
            
            const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
            charCount.title = `${wordCount.toLocaleString()} слов`;
            lineCount.title = `Последняя строка: ${lines[lines.length - 1]?.length || 0} символов`;
            
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
            console.log('⟨UI⟩ Настройки сохранены:', preferences);
        } catch (error) {
            console.error('⟨UI⟩ Ошибка сохранения настроек:', error);
        }
    }

    loadPreferences() {
        try {
            const saved = localStorage.getItem('seekeechEditorPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.isDarkTheme = preferences.theme === 'dark';
                this.isPreviewMode = preferences.preview || false;
                
                const formatSelector = document.getElementById('formatSelector');
                if (formatSelector && preferences.lastFormat) {
                    formatSelector.value = preferences.lastFormat;
                }
                
                console.log('⟨UI⟩ Настройки загружены:', preferences);
            } else {
                console.log('⟨UI⟩ Сохраненных настроек не найдено, используются значения по умолчанию');
            }
        } catch (error) {
            console.error('⟨UI⟩ Ошибка загрузки настроек:', error);
            this.isDarkTheme = true;
            this.isPreviewMode = false;
        }
    }

    showError(message, details = '') {
        console.error('⟨UI⟩ Ошибка:', message, details);
        this.updateStatus(`Ошибка: ${message}`, 'error');
        
        if (details) {
            console.error('⟨UI⟩ Детали ошибки:', details);
        }
        
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info', duration = 3000) {
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
        
        const typeStyles = {
            error: 'background: var(--error-color); color: white;',
            success: 'background: var(--success-color); color: white;',
            warning: 'background: var(--warning-color); color: black;',
            info: 'background: var(--accent-color); color: white;'
        };
        
        notification.style.cssText += typeStyles[type] || typeStyles.info;
        notification.textContent = message;
        notification.classList.add('fade-in');
        
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
        
        console.log(`⟨UI⟩ Уведомление: ${message} (${type})`);
    }

    showLoading(message = 'Загрузка...') {
        this.updateStatus(message, 'info');
        const statusElement = document.getElementById('fileStatus');
        if (statusElement) {
            statusElement.innerHTML = `⏳ ${message}`;
        }
        console.log(`⟨UI⟩ Показан индикатор загрузки: ${message}`);
    }

    hideLoading() {
        const statusElement = document.getElementById('fileStatus');
        if (statusElement && statusElement.innerHTML.includes('⏳')) {
            statusElement.textContent = 'Готов к работе';
            statusElement.className = 'file-status status-info';
            console.log('⟨UI⟩ Индикатор загрузки скрыт');
        }
    }

    // Метод для отладки текущего состояния
    debugState() {
        return {
            isDarkTheme: this.isDarkTheme,
            isPreviewMode: this.isPreviewMode,
            tipsVisible: this.tipsVisible,
            isMobile: this.isMobile,
            preferences: localStorage.getItem('seekeechEditorPreferences')
        };
    }
}

// Добавляем улучшенные стили
const style = document.createElement('style');
style.textContent = `
    [data-theme="dark"] {
        color-scheme: dark;
    }
    
    [data-theme="light"] {
        color-scheme: light;
    }
    
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
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        cursor: pointer;
        border-radius: 8px;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .mobile-btn:hover {
        background: var(--accent-color);
        transform: scale(1.1);
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
    
    /* Принудительное применение темы ко всем элементам */
    * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    
    /* Улучшенный скролл для мобильных */
    @media (max-width: 768px) {
        .editor-panel, .preview-panel {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }
    }
    
    /* Гарантированное применение темы к body */
    body {
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
    }
    
    /* Гарантированное применение темы к основным контейнерам */
    .app-container, .editor-header, .toolbar, .editor-container, .status-bar {
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
    }
`;
document.head.appendChild(style);

console.log('⟨UI⟩ Стили интерфейса применены');

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
        }
