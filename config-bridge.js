/**
 * CEVA Config Bridge v3.1
 * Czyta konfigurację oddziału z localStorage (zapisaną przez plik config-KOD.html)
 * i udostępnia jako window.CEVA_CONFIG kompatybilny ze starym API.
 *
 * Fallback: jeśli brak configu w localStorage → używa config.js (Orange)
 */

(function() {

    // ─── Pobierz config z localStorage ──────────────────────────────────────
    function getStoredConfig() {
        try {
            const raw = localStorage.getItem('ceva_branch_config');
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.warn('[ConfigBridge] Błąd parsowania localStorage:', e);
            return null;
        }
    }

    // ─── Konwertuj nowy format → API CEVA_CONFIG ────────────────────────────
    function buildCEVA_CONFIG(cfg) {
        return {
            _raw: cfg,
            sharePointSite: 'https://cevalogisticsoffice365.sharepoint.com/sites/AuditTool',
            sharePointDocuments: 'Shared%20Documents',
            defaultBranch: cfg.code,
            folders: { fiveS:'5S', gemba:'Gemba', process:'Process', problems:'Problems' },
            branches: { [cfg.code]: buildBranch(cfg) },

            getBranch: function(code) { return this.branches[code] || this.branches[this.defaultBranch]; },
            getCurrentBranch: function() { return this.branches[this.defaultBranch]; },
            setBranch: function(code) {
                if(this.branches[code]){ localStorage.setItem('ceva_selected_branch',code); return true; }
                return false;
            },
            generateFileName: function(type, zone, date) {
                const b=this.getCurrentBranch();
                const d=date||new Date().toISOString().split('T')[0];
                return type+'_'+b.code+'_'+zone.replace(/\s+/g,'')+'_'+d+'.json';
            },
            getDepartments: function() {
                const b=this.getCurrentBranch();
                return [...new Set(b.instructions.map(i=>i.department).filter(Boolean))].sort();
            },
            getProcessesByDepartment: function(dept) {
                const b=this.getCurrentBranch();
                return [...new Set(b.instructions.filter(i=>i.department===dept).map(i=>i.process).filter(Boolean))].sort();
            },
            getInstructionsByDepartmentAndProcess: function(dept, proc) {
                const b=this.getCurrentBranch();
                const seen=new Set();
                return b.instructions
                    .filter(i=>i.department===dept && i.process===proc)
                    .filter(i=>{ if(seen.has(i.code)) return false; seen.add(i.code); return true; })
                    .map(i=>({code:i.code, name:i.name, fullName:i.code+' - '+i.name}));
            },
            getAllInstructions: function() {
                const b=this.getCurrentBranch();
                const seen=new Set();
                return b.instructions
                    .filter(i=>{ if(seen.has(i.code)) return false; seen.add(i.code); return true; })
                    .map(i=>({code:i.code, name:i.name, fullName:i.code+' - '+i.name}))
                    .sort((a,b)=>a.code.localeCompare(b.code));
            },
            getGembaParticipants: function(level) {
                const b=this.getCurrentBranch(), p=b.gembaParticipants;
                if(level===1) return [...(p.level1||[])];
                if(level===2) return [...(p.level1||[]),...(p.level2||[])];
                if(level===3) return [...(p.level1||[]),...(p.level2||[]),...(p.level3||[])];
                return [];
            },
            getGembaCategories: function() {
                return Object.keys(this.getCurrentBranch().gembaQuestions||{});
            },
            getGembaQuestions: function(level, category) {
                const qs=(this.getCurrentBranch().gembaQuestions||{})[category];
                return (qs||[]).filter(q=>q.levels&&q.levels.includes(level));
            }
        };
    }

    function buildBranch(cfg) {
        return {
            code: cfg.code, name: cfg.name, country: cfg.country||'PL',
            fullName: cfg.fullName||cfg.name,
            sharePointFolder: cfg.sharePointFolder||cfg.code,
            email: cfg.email||'',
            zones: (cfg.zones||[]).map((z,i)=>({id:z.id||i+1, name:z.name, responsible:z.responsible||'', target:z.target||90})),
            auditors5S: (cfg.auditors5S||[]).map(a=>typeof a==='string'?a:a.name),
            auditors: (cfg.auditors||[]).map(a=>typeof a==='string'?a:a.name),
            instructions: (cfg.instructions||[]).map(i=>({code:i.code, name:i.name, department:i.department||'', process:i.process||''})),
            gembaParticipants: { level1:cfg.gembaParticipants?.level1||[], level2:cfg.gembaParticipants?.level2||[], level3:cfg.gembaParticipants?.level3||[] },
            gembaQuestions: cfg.gembaQuestions||{},
            problemCategories: cfg.problemCategories||['5S','Bezpieczeństwo','Jakość','Produktywność','Inne']
        };
    }

    // ─── Główna logika ───────────────────────────────────────────────────────
    const stored = getStoredConfig();

    // Config jest prawidłowy jeśli ma kod oddziału i co najmniej jedną strefę
    const isValidConfig = stored && stored.code && stored.zones && stored.zones.length > 0;

    if (isValidConfig) {
        // Mamy config z localStorage (wysłany przez Teams) — nadpisuje config.js
        window.CEVA_CONFIG = buildCEVA_CONFIG(stored);
        console.log('[ConfigBridge] ✅ Config z localStorage:', stored.code, stored.name);
        document.dispatchEvent(new CustomEvent('ceva-config-loaded', {
            detail: { source:'localStorage', code:stored.code, name:stored.name }
        }));
    } else {
        // Brak configu w localStorage — użyj config.js (fallback dla Orange i innych)
        // Sprawdź po DOMContentLoaded bo config.js może się jeszcze ładować
        var checkConfig = function() {
            if (typeof window.CEVA_CONFIG !== 'undefined') {
                console.log('[ConfigBridge] ℹ️ Używam CEVA_CONFIG z config.js');
                // Config.js załadowany poprawnie — nie pokazuj bannera
            } else {
                console.warn('[ConfigBridge] ⚠️ Brak konfiguracji!');
                window.CEVA_CONFIG_MISSING = true;
                if (document.querySelector('.header')) showMissingBanner();
            }
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkConfig);
        } else {
            // DOM już gotowy (bridge załadowany po DOMContentLoaded)
            checkConfig();
        }
    }

    function showMissingBanner() {
        const b = document.createElement('div');
        b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#e8192c;color:white;padding:14px 20px;font-family:Segoe UI,sans-serif;font-size:0.9em;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
        b.innerHTML = '⚠️ <strong>Brak konfiguracji oddziału.</strong> Poproś kierownika o przesłanie pliku konfiguracyjnego przez Teams. <button onclick="this.parentElement.remove()" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:white;padding:4px 12px;border-radius:4px;cursor:pointer;margin-left:12px;">✕</button>';
        document.body.prepend(b);
    }

    // Narzędzia diagnostyczne
    window.CEVA_CONFIG_INFO = function() {
        const s = getStoredConfig();
        return s ? { source:'localStorage', code:s.code, name:s.name, generatedAt:s.generatedAt }
                 : { source:'config.js (legacy)', code:'ORA-PL-01' };
    };
    window.CEVA_CLEAR_CONFIG = function() {
        ['ceva_branch_config','ceva_branch_code','ceva_config_version'].forEach(k=>localStorage.removeItem(k));
        location.reload();
    };

})();
