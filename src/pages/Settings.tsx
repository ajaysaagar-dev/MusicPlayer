import { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
    UserCircle,
    Camera,
    CheckCircle2,
    Circle,
    Users,
    Zap,
    Clock,
    Waves,
    CloudLightning,
    Save,
    Check,
    Eye,
    Settings as SettingsIcon,
    Music,
    Layout,
    ShieldCheck,
    User,
    MonitorPlay,
    Volume2
} from 'lucide-react';

function Toggle({
    checked = false,
    onChange,
}: {
    checked?: boolean;
    onChange?: (val: boolean) => void;
}) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <button
                onClick={() => onChange?.(!checked)}
                className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}
            >
                <div
                    className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${checked
                        ? 'translate-x-7 bg-on-primary-fixed'
                        : 'translate-x-1 bg-on-surface-variant'
                        }`}
                />
            </button>
        </label>
    );
}

type SettingsTab = 'profile' | 'nowplaying' | 'audio' | 'appearance' | 'privacy';

export default function Settings() {
    const { data, isLoading } = useDatabase();
    const { account, updateAccount } = data;

    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

    const [localName, setLocalName] = useState(account.profile?.name || '');
    const [localEmail, setLocalEmail] = useState(account.profile?.email || '');

    // Now Playing local temp states
    const [tempZoomSpeed, setTempZoomSpeed] = useState(account.settings?.zoomSpeed || 10);
    const [tempBlurLevel, setTempBlurLevel] = useState(account.settings?.blurLevel ?? 1);

    // Sync local state
    useEffect(() => {
        if (account.profile) {
            setLocalName(account.profile.name);
            setLocalEmail(account.profile.email);
        }
        if (account.settings) {
            setTempZoomSpeed(account.settings.zoomSpeed || 10);
            setTempBlurLevel(account.settings.blurLevel ?? 1);
        }
    }, [account]);

    const updateProfile = async () => {
        const newAccount = {
            ...account,
            profile: { ...account.profile, name: localName, email: localEmail }
        };
        await updateAccount(newAccount);
    };

    const updateSetting = async (key: string, value: any) => {
        const newAccount = {
            ...account,
            settings: { ...account.settings, [key]: value }
        };
        await updateAccount(newAccount);
    };

    const applyNowPlayingSettings = async () => {
        const newAccount = {
            ...account,
            settings: {
                ...account.settings,
                zoomSpeed: tempZoomSpeed,
                blurLevel: tempBlurLevel
            }
        };
        await updateAccount(newAccount);
    };

    const isNowPlayingChanged =
        tempZoomSpeed !== account.settings?.zoomSpeed ||
        tempBlurLevel !== account.settings?.blurLevel;

    const tabs = [
        { id: 'profile', label: 'Cloud Identity', icon: User },
        { id: 'nowplaying', label: 'Now Playing', icon: MonitorPlay },
        { id: 'audio', label: 'Audio Quality', icon: Volume2 },
        { id: 'appearance', label: 'Atmospheric Design', icon: Layout },
        { id: 'privacy', label: 'Privacy & Safety', icon: ShieldCheck },
    ] as const;

    return (
        <div className="px-4 max-w-7xl pb-20">
            <header className="mb-12">
                <h2 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface mb-2">
                    Settings
                    {account.profile?.name && <span className="text-primary/40 text-2xl ml-4 font-black">/ {account.profile.name}</span>}
                </h2>
                <p className="text-on-surface-variant text-lg font-body">
                    Management terminal for your <span className="text-primary font-bold">account.json</span> cloud vault.
                </p>
            </header>

            <div className="grid grid-cols-12 gap-12 bg-surface-container/30 rounded-[3.5rem] p-4 border border-white/5 min-h-[600px] backdrop-blur-3xl shadow-2xl">
                {/* Internal Sidebar */}
                <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-2 p-2 pt-6">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 group ${isActive
                                    ? 'bg-primary text-on-primary-fixed shadow-xl shadow-primary/20 scale-105 z-10'
                                    : 'text-on-surface-variant hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-on-primary-fixed' : 'text-primary opacity-40 group-hover:opacity-100 transition-opacity'} />
                                <span className="font-black uppercase tracking-widest text-[10px]">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Dynamic Section Area */}
                <div className="col-span-12 md:col-span-8 lg:col-span-9 p-10 bg-surface-container-highest/30 rounded-[3rem] border border-white/5 relative overflow-hidden">

                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
                        <SettingsIcon size={300} />
                    </div>

                    <div className="relative z-10 animate-fade-in-up">
                        {activeTab === 'profile' && (
                            <section className="space-y-10">
                                <div>
                                    <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">Identity Management</span>
                                    <h3 className="text-4xl font-black font-headline tracking-tighter mb-4">Cloud Identity</h3>
                                    <p className="text-on-surface-variant text-sm font-medium">Configure your global profile and sync metadata to the GitHub database.</p>
                                </div>

                                <div className="space-y-10">
                                    <div className="flex items-center gap-10">
                                        <div className="relative group cursor-pointer shrink-0">
                                            <div className="w-40 h-40 rounded-[2.5rem] bg-surface-container-highest border-4 border-white/5 overflow-hidden flex items-center justify-center shadow-2xl">
                                                <UserCircle size={80} className="text-primary/40 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-md h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                <Camera size={20} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-6">
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-2">Display Name</label>
                                                    <input
                                                        className="w-full bg-surface-container border border-white/5 rounded-2xl px-6 py-4 text-on-surface focus:ring-1 focus:ring-primary/30 outline-none font-bold shadow-inner"
                                                        type="text"
                                                        value={localName}
                                                        onChange={(e) => setLocalName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-2">Vault Email</label>
                                                    <input
                                                        className="w-full bg-surface-container border border-white/5 rounded-2xl px-6 py-4 text-on-surface focus:ring-1 focus:ring-primary/30 outline-none font-bold shadow-inner"
                                                        type="email"
                                                        value={localEmail}
                                                        onChange={(e) => setLocalEmail(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                disabled={isLoading}
                                                onClick={updateProfile}
                                                className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-105 hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center gap-4 shadow-xl shadow-black/20 disabled:opacity-50"
                                            >
                                                {isLoading ? <CloudLightning size={18} className="animate-pulse" /> : <Save size={18} />}
                                                Commit Identity Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'nowplaying' && (
                            <section className="space-y-12">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">Cinematic Controls</span>
                                        <h3 className="text-4xl font-black font-headline tracking-tighter mb-4">Now Playing Immersion</h3>
                                        <p className="text-on-surface-variant text-sm font-medium">Fine-tune the theatrical presentation of your currently playing tracks.</p>
                                    </div>
                                    <button
                                        disabled={isLoading || !isNowPlayingChanged}
                                        onClick={applyNowPlayingSettings}
                                        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all ${isNowPlayingChanged
                                            ? 'bg-primary text-on-primary-fixed shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95'
                                            : 'bg-white/5 text-white/10 opacity-50'
                                            }`}
                                    >
                                        {isLoading ? <CloudLightning size={16} className="animate-pulse" /> : <Check size={16} />}
                                        Apply Atmos
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-8 bg-surface-container rounded-[2.5rem] border border-white/5 flex items-center justify-between gap-10 hover:bg-white/5 transition-colors group">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform"><Clock size={24} /></div>
                                                <h4 className="text-xl font-black text-on-surface tracking-tight">Parallax Breathing Speed</h4>
                                            </div>
                                            <p className="text-xs text-on-surface-variant/60 font-bold ml-14">Defines the duration of the push-pull zoom cycle.</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-3xl font-black font-mono text-primary min-w-[80px] text-right">{tempZoomSpeed}s</span>
                                            <input
                                                type="range" min="2" max="40"
                                                value={tempZoomSpeed}
                                                onChange={(e) => setTempZoomSpeed(parseInt(e.target.value))}
                                                className="w-48 h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-8 bg-surface-container rounded-[2.5rem] border border-white/5 flex items-center justify-between gap-10 hover:bg-white/5 transition-colors group">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform"><Eye size={24} /></div>
                                                <h4 className="text-xl font-black text-on-surface tracking-tight">Environmental Blur Depth</h4>
                                            </div>
                                            <p className="text-xs text-on-surface-variant/60 font-bold ml-14">Depth-of-field effect for background artworks.</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-3xl font-black font-mono text-primary min-w-[80px] text-right">{tempBlurLevel === 0 ? 'OFF' : `${tempBlurLevel}px`}</span>
                                            <input
                                                type="range" min="0" max="25"
                                                value={tempBlurLevel}
                                                onChange={(e) => setTempBlurLevel(parseInt(e.target.value))}
                                                className="w-48 h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'audio' && (
                            <section className="space-y-12">
                                <div>
                                    <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">High-Resolution Pipeline</span>
                                    <h3 className="text-4xl font-black font-headline tracking-tighter mb-4">Audio Fidelity</h3>
                                    <p className="text-on-surface-variant text-sm font-medium">Optimize your auditory stream and synchronization bandwidth.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-8 bg-surface-container rounded-[2.5rem] border border-white/5 flex justify-between items-center group">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-secondary/10 rounded-3xl text-secondary"><Zap size={28} /></div>
                                            <div>
                                                <h4 className="text-xl font-black text-on-surface">Lossless Streaming</h4>
                                                <p className="text-xs text-on-surface-variant/60 font-bold">Prioritize high-fidelity source audio</p>
                                            </div>
                                        </div>
                                        <Toggle
                                            checked={account.settings?.lossless || false}
                                            onChange={(val) => updateSetting('lossless', val)}
                                        />
                                    </div>

                                    <div className="p-8 bg-surface-container rounded-[2.5rem] border border-white/5 flex justify-between items-center group">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-secondary/10 rounded-3xl text-secondary"><Waves size={28} /></div>
                                            <div>
                                                <h4 className="text-xl font-black text-on-surface">Global Stream Bitrate</h4>
                                                <p className="text-xs text-on-surface-variant/60 font-bold">Adjust for network environment</p>
                                            </div>
                                        </div>
                                        <select
                                            value={account.settings?.bitrate || 'Extreme (320kbps)'}
                                            onChange={(e) => updateSetting('bitrate', e.target.value)}
                                            className="bg-surface-container-highest border-none rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest text-on-surface focus:ring-1 focus:ring-secondary/30 min-w-[240px] outline-none appearance-none cursor-pointer"
                                        >
                                            <option>Normal (96kbps)</option>
                                            <option>High (160kbps)</option>
                                            <option>Extreme (320kbps)</option>
                                            <option>Studio (Hi-Res)</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'appearance' && (
                            <section className="space-y-12">
                                <div>
                                    <span className="text-tertiary font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">Interface Visualization</span>
                                    <h3 className="text-4xl font-black font-headline tracking-tighter mb-4">Atmospheric Design</h3>
                                    <p className="text-on-surface-variant text-sm font-medium">Customize the aesthetic personality of the MyPlay player.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div
                                        className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 overflow-hidden relative group ${account.settings?.theme === 'nebula' ? 'border-primary bg-primary/5 scale-105 shadow-2xl' : 'border-white/5 bg-surface-container opacity-50 grayscale hover:grayscale-0 hover:opacity-100'}`}
                                        onClick={() => updateSetting('theme', 'nebula')}
                                    >
                                        <div className="w-full aspect-video rounded-3xl bg-surface mb-6 overflow-hidden relative border border-white/10">
                                            <div className="absolute inset-0 mesh-gradient opacity-40 animate-pulse" />
                                            <div className="absolute inset-x-4 bottom-4 h-3 bg-primary/20 rounded-full overflow-hidden">
                                                <div className="w-2/3 h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center px-2">
                                            <div>
                                                <h4 className="font-black text-lg">Nebula Flow</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Liquid Blurred Accents</p>
                                            </div>
                                            {account.settings?.theme === 'nebula' ? (<CheckCircle2 size={24} className="text-primary" />) : (<Circle size={24} className="text-white/20" />)}
                                        </div>
                                    </div>

                                    <div
                                        className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 overflow-hidden relative group ${account.settings?.theme === 'onyx' ? 'border-primary bg-primary/5 scale-105 shadow-2xl' : 'border-white/5 bg-surface-container opacity-50 grayscale hover:grayscale-0 hover:opacity-100'}`}
                                        onClick={() => updateSetting('theme', 'onyx')}
                                    >
                                        <div className="w-full aspect-video rounded-3xl bg-zinc-950 mb-6 overflow-hidden relative border border-white/5">
                                            <div className="absolute inset-4 space-y-3">
                                                <div className="w-full h-3 bg-zinc-800 rounded-full" />
                                                <div className="w-3/4 h-3 bg-zinc-800 rounded-full opacity-50" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center px-2">
                                            <div>
                                                <h4 className="font-black text-lg">Deep Onyx</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Solid Minimalist Slate</p>
                                            </div>
                                            {account.settings?.theme === 'onyx' ? (<CheckCircle2 size={24} className="text-primary" />) : (<Circle size={24} className="text-white/20" />)}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'privacy' && (
                            <section className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                                <ShieldCheck size={80} className="mb-6" />
                                <h4 className="text-2xl font-black uppercase tracking-widest mb-2">Security Vault</h4>
                                <p className="max-w-xs font-bold text-sm">Privacy and security controls are currently managed at the GitHub repository level.</p>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
