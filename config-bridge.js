
/* LZ-string decompress (c) 2013 pieroxy.net - MIT License */
var LZString=function(){var r=String.fromCharCode,t={},i={decompress:function(o){return i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,e,t){var i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",_=[],y={val:t(0),position:e,index:1};for(i=0;i<3;i+=1)f[i]=i;p=0;c=Math.pow(2,2);a=1;for(;a!=c;)u=y.val&y.position,y.position>>=1,0==y.position&&(y.position=e,y.val=t(y.index++)),p|=(u>0?1:0)*a,a<<=1;switch(s=p){case 0:p=0;c=Math.pow(2,8);a=1;for(;a!=c;)u=y.val&y.position,y.position>>=1,0==y.position&&(y.position=e,y.val=t(y.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:p=0;c=Math.pow(2,16);a=1;for(;a!=c;)u=y.val&y.position,y.position>>=1,0==y.position&&(y.position=e,y.val=t(y.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}f[3]=l;v=l;_.push(l);for(;;){if(y.index>o)return"";p=0;c=Math.pow(2,m);a=1;for(;a!=c;)u=y.val&y.position,y.position>>=1,0==y.position&&(y.position=e,y.val=t(y.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:p=0;c=Math.pow(2,8);a=1;for(;a!=c;)u=y.val&y.position,y.position>>=1,0==y.position&&(y.position=e,y.val=t(y.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p);l=d-1;h--;break;case 1:p=0;c=Math.pow(2,16);a=1;for(;a!=c;)u=y.val&y.position,y.position>>=1,0==y.position&&(y.position=e,y.val=t(y.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p);l=d-1;h--;break;case 2:return _.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])i=f[l];else{if(l!==d)return null;i=v+v.charAt(0)}_.push(i);f[d++]=v+i.charAt(0);h--;v=i;0==h&&(h=Math.pow(2,m),m++)}}};return i}();

/**
 * CEVA Config Bridge v3.0
 * Łączy nowy format konfiguracji multi-branch (zapisany w localStorage przez plik Teams)
 * ze starym API CEVA_CONFIG używanym przez mobile-index.html, 5s-audit.html, gemba-audit.html, process-audit.html
 *
 * Kolejność ładowania:
 * 1. Szuka konfiguracji w localStorage (zapisanej przez plik config-KOD.html)
 * 2. Jeśli brak — używa domyślnego CEVA_CONFIG z config.js (fallback dla Orange)
 * 3. Jeśli brak config.js — wyświetla komunikat o braku konfiguracji
 */

(function() {

    // ─── 1. Pobierz config z localStorage ───────────────────────────────────
    function getStoredConfig() {
        try {
            const raw = localStorage.getItem('ceva_branch_config');
            if (!raw) return null;
            // Obsługa zarówno skompresowanego jak i zwykłego JSON
            // Skompresowany zaczyna się od znaku który nie jest '{' ani '['
            const firstChar = raw.charCodeAt(0);
            if (firstChar !== 123 && firstChar !== 91) {
                // Prawdopodobnie skompresowany LZ-string
                const decompressed = LZString.decompress(raw);
                if (!decompressed) {
                    console.warn('[ConfigBridge] Dekompresja nie powiodła się, próba bezpośrednio');
                    return JSON.parse(raw);
                }
                return JSON.parse(decompressed);
            }
            return JSON.parse(raw);
        } catch (e) {
            console.warn('[ConfigBridge] Błąd parsowania localStorage:', e);
            return null;
        }
    }

    // ─── 2. Konwertuj nowy format → API CEVA_CONFIG ──────────────────────────
    function buildCEVA_CONFIG(cfg) {
        return {
            // Zachowaj oryginalne dane
            _raw: cfg,

            sharePointSite: 'https://cevalogisticsoffice365.sharepoint.com/sites/AuditTool',
            sharePointDocuments: 'Shared%20Documents',
            defaultBranch: cfg.code,

            folders: {
                fiveS: '5S',
                gemba: 'Gemba',
                process: 'Process',
                problems: 'Problems'
            },

            // Buduj strukturę branches kompatybilną ze starym API
            branches: {
                [cfg.code]: buildBranch(cfg)
            },

            // ─── Funkcje API (te same sygnatury co stary config.js) ───────────

            getBranch: function(code) {
                return this.branches[code] || this.branches[this.defaultBranch];
            },

            getCurrentBranch: function() {
                return this.branches[this.defaultBranch];
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
                return this.sharePointSite;
            },

            getDepartments: function() {
                const branch = this.getCurrentBranch();
                const depts = [...new Set(branch.instructions.map(i => i.department).filter(Boolean))];
                return depts.sort();
            },

            getProcessesByDepartment: function(department) {
                const branch = this.getCurrentBranch();
                const procs = branch.instructions
                    .filter(i => i.department === department)
                    .map(i => i.process)
                    .filter(Boolean);
                return [...new Set(procs)].sort();
            },

            getInstructionsByDepartmentAndProcess: function(department, process) {
                const branch = this.getCurrentBranch();
                const seen = new Set();
                return branch.instructions
                    .filter(i => i.department === department && i.process === process)
                    .filter(i => {
                        if (seen.has(i.code)) return false;
                        seen.add(i.code);
                        return true;
                    })
                    .map(i => ({ code: i.code, name: i.name, fullName: `${i.code} - ${i.name}` }));
            },

            getAllInstructions: function() {
                const branch = this.getCurrentBranch();
                const seen = new Set();
                return branch.instructions
                    .filter(i => {
                        if (seen.has(i.code)) return false;
                        seen.add(i.code);
                        return true;
                    })
                    .map(i => ({ code: i.code, name: i.name, fullName: `${i.code} - ${i.name}` }))
                    .sort((a, b) => a.code.localeCompare(b.code));
            },

            getInstructionDetails: function(code) {
                const branch = this.getCurrentBranch();
                return branch.instructions.filter(i => i.code === code);
            },

            getGembaParticipants: function(level) {
                const branch = this.getCurrentBranch();
                const p = branch.gembaParticipants;
                if (level === 1) return [...(p.level1 || [])];
                if (level === 2) return [...(p.level1 || []), ...(p.level2 || [])];
                if (level === 3) return [...(p.level1 || []), ...(p.level2 || []), ...(p.level3 || [])];
                return [];
            },

            getGembaCategories: function() {
                const branch = this.getCurrentBranch();
                return Object.keys(branch.gembaQuestions || {});
            },

            getGembaQuestions: function(level, category) {
                const branch = this.getCurrentBranch();
                const questions = (branch.gembaQuestions || {})[category];
                if (!questions) return [];
                return questions.filter(q => q.levels && q.levels.includes(level));
            }
        };
    }

    // ─── 3. Buduj obiekt branch ──────────────────────────────────────────────
    function buildBranch(cfg) {
        return {
            code: cfg.code,
            name: cfg.name,
            country: cfg.country || 'PL',
            fullName: cfg.fullName || cfg.name,
            sharePointFolder: cfg.sharePointFolder || cfg.code,
            email: cfg.email || '',

            zones: (cfg.zones || []).map((z, i) => ({
                id: z.id || i + 1,
                name: z.name,
                responsible: z.responsible || '',
                target: z.target || 90
            })),

            // auditors5S może być tablicą stringów lub obiektów
            auditors5S: (cfg.auditors5S || []).map(a => typeof a === 'string' ? a : a.name),

            // auditors może być tablicą stringów lub obiektów
            auditors: (cfg.auditors || []).map(a => typeof a === 'string' ? a : a.name),

            instructions: (cfg.instructions || []).map(i => ({
                code: i.code,
                name: i.name,
                department: i.department || '',
                process: i.process || '',
                assigned: true
            })),

            gembaParticipants: {
                level1: cfg.gembaParticipants?.level1 || [],
                level2: cfg.gembaParticipants?.level2 || [],
                level3: cfg.gembaParticipants?.level3 || []
            },

            gembaQuestions: cfg.gembaQuestions || {},

            problemCategories: cfg.problemCategories || ['5S', 'Bezpieczeństwo', 'Jakość', 'Produktywność', 'Inne']
        };
    }

    // ─── 4. Główna logika ────────────────────────────────────────────────────
    const stored = getStoredConfig();

    if (stored) {
        // Nowy config z pliku Teams — zastąp lub uzupełnij CEVA_CONFIG
        window.CEVA_CONFIG = buildCEVA_CONFIG(stored);
        console.log('[ConfigBridge] ✅ Załadowano config z localStorage:', stored.code, stored.name);

        // Emituj zdarzenie żeby strony mogły reagować
        document.dispatchEvent(new CustomEvent('ceva-config-loaded', {
            detail: { source: 'localStorage', code: stored.code, name: stored.name }
        }));
    } else {
        // Brak nowego configu — sprawdź czy jest stary CEVA_CONFIG z config.js
        if (typeof window.CEVA_CONFIG !== 'undefined') {
            console.log('[ConfigBridge] ℹ️ Używam istniejącego CEVA_CONFIG (config.js)');
        } else {
            // Absolutny fallback — pokaż komunikat
            console.warn('[ConfigBridge] ⚠️ Brak konfiguracji oddziału!');
            window.CEVA_CONFIG_MISSING = true;

            // Opóźniony alert żeby DOM był gotowy
            document.addEventListener('DOMContentLoaded', function() {
                // Tylko jeśli jesteśmy na stronie mobilnej (nie na generatorze)
                if (document.querySelector('.header') || document.querySelector('#branchInfo')) {
                    showConfigMissingBanner();
                }
            });
        }
    }

    // ─── 5. Banner "brak konfiguracji" ──────────────────────────────────────
    function showConfigMissingBanner() {
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
            background: #e8192c; color: white; padding: 14px 20px;
            font-family: 'Segoe UI', sans-serif; font-size: 0.9em;
            text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        banner.innerHTML = `
            ⚠️ <strong>Brak konfiguracji oddziału.</strong>
            Poproś kierownika o przesłanie pliku konfiguracyjnego przez Teams.
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4);
                color: white; padding: 4px 12px; border-radius: 4px; cursor: pointer;
                margin-left: 12px; font-size: 0.9em;
            ">✕</button>
        `;
        document.body.prepend(banner);
    }

    // ─── 6. Pomocnicza funkcja do sprawdzenia wersji configu ─────────────────
    window.CEVA_CONFIG_INFO = function() {
        const stored = getStoredConfig();
        if (stored) {
            return {
                source: 'localStorage (Teams)',
                code: stored.code,
                name: stored.name,
                generatedAt: stored.generatedAt,
                version: stored.version
            };
        }
        return { source: 'config.js (legacy)', code: 'ORA-PL-01' };
    };

    // ─── 7. Funkcja do czyszczenia configu (dla testów) ──────────────────────
    window.CEVA_CLEAR_CONFIG = function() {
        localStorage.removeItem('ceva_branch_config');
        localStorage.removeItem('ceva_branch_code');
        localStorage.removeItem('ceva_config_version');
        location.reload();
    };

})();
