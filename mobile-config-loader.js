// DYNAMICZNY LOADER KONFIGURACJI Z SHAREPOINT
// Ładuje config.js z SharePoint zamiast z GitHub

const CONFIG_LOADER = {
    // URL do SharePoint gdzie przechowywany jest config.js
    sharePointBaseUrl: 'https://cevalogisticsoffice365.sharepoint.com/sites/AuditTool',
    configFileName: 'config.js',
    
    // Cache w localStorage (żeby nie pobierać za każdym razem)
    cacheKey: 'ceva_config_cache',
    cacheTimeKey: 'ceva_config_cache_time',
    cacheValidityHours: 24, // Cache ważny przez 24h
    
    // Fallback config (podstawowa konfiguracja gdyby SharePoint był niedostępny)
    fallbackConfig: {
        sharePointSite: 'https://cevalogisticsoffice365.sharepoint.com/sites/AuditTool',
        sharePointDocuments: 'Shared%20Documents',
        folders: {
            fiveS: '5S',
            gemba: 'Gemba',
            process: 'Process',
            problems: 'Problems'
        },
        branches: {
            'ORA-PL-01': {
                code: 'ORA-PL-01',
                name: 'Orange',
                country: 'PL',
                fullName: 'CEVA Orange Poland',
                sharePointFolder: 'ORA-PL-01_Orange',
                zones: [
                    {id: 1, name: 'Inbound', responsible: 'Manager', target: 90}
                ],
                auditors: ['Auditor'],
                problemCategories: ['5S', 'Bezpieczeństwo', 'Jakość', 'Produktywność', 'Inne'],
                processesByDepartment: {},
                instructions: []
            }
        },
        defaultBranch: 'ORA-PL-01',
        getBranch: function(code) {
            return this.branches[code] || this.branches[this.defaultBranch];
        },
        getCurrentBranch: function() {
            const savedBranch = localStorage.getItem('ceva_selected_branch');
            return this.getBranch(savedBranch || this.defaultBranch);
        },
        setBranch: function(code) {
            if (this.branches[code]) {
                localStorage.setItem('ceva_selected_branch', code);
                return true;
            }
            return false;
        },
        generateFileName: function(type, zone, date) {
            const branch = this.getCurrentBranch();
            const dateStr = date || new Date().toISOString().split('T')[0];
            const zoneStr = zone.replace(/\s+/g, '');
            return `${type}_${branch.code}_${zoneStr}_${dateStr}.json`;
        },
        getSharePointFolderUrl: function(branchCode, folderType) {
            const branch = this.branches[branchCode];
            if (!branch) return this.sharePointSite;
            const folderName = this.folders[folderType];
            return `${this.sharePointSite}/${this.sharePointDocuments}/Forms/AllItems.aspx?id=%2Fsites%2FAuditTool%2F${this.sharePointDocuments}%2F${branch.sharePointFolder}%2F${folderName}`;
        }
    },
    
    // Sprawdź czy cache jest ważny
    isCacheValid: function() {
        const cacheTime = localStorage.getItem(this.cacheTimeKey);
        if (!cacheTime) return false;
        
        const now = new Date().getTime();
        const cacheAge = (now - parseInt(cacheTime)) / (1000 * 60 * 60); // w godzinach
        
        return cacheAge < this.cacheValidityHours;
    },
    
    // Pobierz config z cache
    getFromCache: function() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                console.log('✅ Załadowano config z cache');
                return JSON.parse(cached);
            }
        } catch (e) {
            console.warn('Błąd odczytu cache:', e);
        }
        return null;
    },
    
    // Zapisz do cache
    saveToCache: function(config) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(config));
            localStorage.setItem(this.cacheTimeKey, new Date().getTime().toString());
            console.log('💾 Config zapisany do cache');
        } catch (e) {
            console.warn('Nie można zapisać do cache:', e);
        }
    },
    
    // Pobierz config z SharePoint
    loadFromSharePoint: async function() {
        const configUrl = `${this.sharePointBaseUrl}/Shared%20Documents/${this.configFileName}`;
        
        try {
            console.log('📥 Pobieranie config z SharePoint...');
            
            const response = await fetch(configUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/javascript, text/javascript, */*'
                },
                credentials: 'include' // Ważne dla SharePoint auth
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const configText = await response.text();
            
            // Usuń definicję CEVA_CONFIG i module.exports, zostaw tylko obiekt
            let configCode = configText
                .replace(/const\s+CEVA_CONFIG\s*=\s*/, '')
                .replace(/if\s*\(typeof\s+module[^}]+}\s*$/, '')
                .trim();
            
            // Usuń końcowy średnik jeśli istnieje
            if (configCode.endsWith(';')) {
                configCode = configCode.slice(0, -1);
            }
            
            // Ewaluuj kod i pobierz obiekt
            const config = eval(`(${configCode})`);
            
            console.log('✅ Config załadowany z SharePoint');
            this.saveToCache(config);
            
            return config;
            
        } catch (error) {
            console.error('❌ Błąd pobierania config z SharePoint:', error);
            throw error;
        }
    },
    
    // Główna funkcja ładująca
    load: async function(forceRefresh = false) {
        // Pokaż loader
        this.showLoader('Ładowanie konfiguracji...');
        
        try {
            // Sprawdź cache
            if (!forceRefresh && this.isCacheValid()) {
                const cached = this.getFromCache();
                if (cached) {
                    this.hideLoader();
                    return cached;
                }
            }
            
            // Pobierz z SharePoint
            try {
                const config = await this.loadFromSharePoint();
                this.hideLoader();
                return config;
            } catch (sharePointError) {
                console.warn('SharePoint niedostępny, sprawdzam cache...');
                
                // Spróbuj cache (nawet jeśli wygasł)
                const cached = this.getFromCache();
                if (cached) {
                    this.hideLoader();
                    this.showWarning('Używam zapisanej konfiguracji (SharePoint niedostępny)');
                    return cached;
                }
                
                // Ostatnia deska ratunku - fallback
                console.warn('Używam fallback config');
                this.hideLoader();
                this.showWarning('Używam podstawowej konfiguracji (brak połączenia)');
                return this.fallbackConfig;
            }
            
        } catch (error) {
            console.error('Krytyczny błąd ładowania config:', error);
            this.hideLoader();
            this.showError('Błąd ładowania konfiguracji');
            return this.fallbackConfig;
        }
    },
    
    // UI helpers
    showLoader: function(message) {
        let loader = document.getElementById('configLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'configLoader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                color: white;
                font-size: 1.2em;
                flex-direction: column;
                gap: 20px;
            `;
            document.body.appendChild(loader);
        }
        loader.innerHTML = `
            <div style="width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <div>${message}</div>
        `;
        
        // Dodaj animację
        if (!document.getElementById('loaderStyle')) {
            const style = document.createElement('style');
            style.id = 'loaderStyle';
            style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
    },
    
    hideLoader: function() {
        const loader = document.getElementById('configLoader');
        if (loader) loader.remove();
    },
    
    showWarning: function(message) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff9800;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            z-index: 100000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        warning.textContent = message;
        document.body.appendChild(warning);
        
        setTimeout(() => warning.remove(), 5000);
    },
    
    showError: function(message) {
        const error = document.createElement('div');
        error.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #f44336;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            z-index: 100000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        error.textContent = message;
        document.body.appendChild(error);
        
        setTimeout(() => error.remove(), 5000);
    }
};

// Globalny obiekt CEVA_CONFIG (będzie nadpisany po załadowaniu)
let CEVA_CONFIG = CONFIG_LOADER.fallbackConfig;
