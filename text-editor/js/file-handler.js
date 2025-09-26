// === ОБРАБОТКА ФАЙЛОВ ===

class FileHandler {
    constructor() {
        this.currentFile = null;
        this.currentContent = '';
    }

    openFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.currentFile = file;
                this.currentContent = e.target.result;
                resolve(this.currentContent);
            };
            
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    saveFile(content, filename, format) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `document.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    detectFormat(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const formatMap = {
            'txt': 'plain',
            'md': 'markdown',
            'html': 'html',
            'css': 'css',
            'js': 'javascript',
            'json': 'json',
            'xml': 'xml',
            'csv': 'csv'
        };
        
        return formatMap[ext] || 'plain';
    }

    getFileInfo() {
        return {
            name: this.currentFile?.name || 'Новый документ',
            size: this.currentFile?.size || 0,
            type: this.currentFile?.type || 'text/plain'
        };
    }
}
