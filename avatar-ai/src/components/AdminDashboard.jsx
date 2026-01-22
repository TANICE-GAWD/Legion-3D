import React, { useState, useEffect } from 'react';
import {
    Map as MapIcon,
    AlertTriangle,
    Heart,
    Settings,
    Bell,
    Users,
    Activity,
    TrendingDown,
    Clock,
    Shield,
    ChevronRight,
    Menu,
    X,
    Circle,
    MapPin,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- STYLES ---
const COLORS = {
  bg: '#4D96FF',
  sidebar: '#FFD93D', // Yellow
  card: '#FFFFFF',
  purple: '#A29BFE',
  red: '#FF6B6B',
  green: '#6BCB77',
  black: '#000000',
};

const NeoCard = ({ children, className = '', color = 'bg-white', noShadow = false }) => (
  <div className={`
    ${color} ${className}
    border-[3px] border-black rounded-[20px]
    ${noShadow ? '' : 'shadow-[6px_6px_0px_0px_black]'}
  `}>
    {children}
  </div>
);

const AdminDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeNav, setActiveNav] = useState('map');

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        });
    };

    // Navigation items
    const navItems = [
        { id: 'map', icon: MapIcon, label: 'Live Map' },
        { id: 'alerts', icon: AlertTriangle, label: 'Alerts' },
        { id: 'community', icon: Heart, label: 'Community' },
        { id: 'settings', icon: Settings, label: 'Config' },
    ];

    // Mock data (Preserved)
    const interventions = [
        { id: 1, ward: 'Ward 7', type: 'Voice Activity Drop', detail: '40% drop (Mrs. Sharma)', status: 'NGO Notified', severity: 'critical', time: '2 min ago' },
        { id: 2, ward: 'Ward 12', type: 'Missed Check-in', detail: 'No response (Mr. Patel)', status: 'Family Contacted', severity: 'critical', time: '15 min ago' },
        { id: 3, ward: 'Ward 3', type: 'Isolation Score', detail: 'Score up 25% (Mrs. Gupta)', status: 'Volunteer Assigned', severity: 'warning', time: '32 min ago' },
        { id: 4, ward: 'Ward 9', type: 'Sentiment Shift', detail: 'Negative sentiment (Mr. Singh)', status: 'Monitoring', severity: 'warning', time: '1 hour ago' },
        { id: 5, ward: 'Ward 5', type: 'Routine Check', detail: 'Wellness call (Mrs. Das)', status: 'Resolved', severity: 'normal', time: '2 hours ago' },
        { id: 6, ward: 'Ward 2', type: 'New Registration', detail: 'Onboarded (Mr. Kumar)', status: 'Active', severity: 'normal', time: '3 hours ago' },
    ];

    const heatmapPoints = [
        { x: 15, y: 25, status: 'critical', label: 'Ward 7' },
        { x: 35, y: 40, status: 'warning', label: 'Ward 12' },
        { x: 55, y: 20, status: 'normal', label: 'Ward 3' },
        { x: 75, y: 55, status: 'normal', label: 'Ward 5' },
        { x: 25, y: 65, status: 'warning', label: 'Ward 9' },
        { x: 60, y: 70, status: 'normal', label: 'Ward 2' },
        { x: 85, y: 30, status: 'normal', label: 'Ward 8' },
        { x: 45, y: 85, status: 'critical', label: 'Ward 11' },
        { x: 20, y: 45, status: 'normal', label: 'Ward 4' },
        { x: 70, y: 40, status: 'warning', label: 'Ward 6' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'bg-[#FF6B6B]';
            case 'warning': return 'bg-[#FF9F43]';
            case 'normal': return 'bg-[#6BCB77]';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="min-h-screen font-sans text-black flex overflow-hidden bg-[#4D96FF]"
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px' }}>
            
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-72 bg-[#FFD93D] border-r-[3px] border-black
                    transform transition-transform duration-300 shadow-[6px_0px_0px_0px_rgba(0,0,0,0.2)]
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    flex flex-col
                `}
            >
                <div className="p-6 border-b-[3px] border-black bg-[#FFD93D]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white border-[3px] border-black flex items-center justify-center shadow-sm">
                                <Shield className="w-7 h-7 text-black" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="font-black text-xl tracking-tight">CareChain</h1>
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70">Admin HQ</p>
                            </div>
                        </div>
                        <button
                            className="lg:hidden text-black hover:scale-110 transition-transform"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-8 h-8" strokeWidth={3} />
                        </button>
                    </div>
                </div>

                <nav className="p-6 space-y-4 flex-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveNav(item.id)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-4 rounded-xl border-[3px] border-black
                                transition-all duration-200 font-bold text-lg
                                ${activeNav === item.id
                                    ? 'bg-white shadow-[4px_4px_0px_0px_black]'
                                    : 'bg-[#FFD93D] border-transparent hover:bg-white hover:border-black'
                                }
                            `}
                        >
                            <item.icon className="w-6 h-6" strokeWidth={2.5} />
                            <span>{item.label}</span>
                            {item.id === 'alerts' && (
                                <span className="ml-auto bg-[#FF6B6B] text-white border-2 border-black text-xs font-black px-2 py-1 rounded-full">
                                    3
                                </span>
                            )}
                        </motion.button>
                    ))}
                </nav>

                <div className="p-6 border-t-[3px] border-black bg-[#fff4c2]">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_black]">
                        <div className="w-10 h-10 rounded-full bg-[#A29BFE] border-2 border-black flex items-center justify-center">
                            <span className="text-sm font-black">AD</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm leading-tight">Admin User</p>
                            <p className="text-xs font-medium text-gray-600">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b-[3px] border-black px-4 lg:px-8 py-4 sticky top-0 z-30 shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                className="lg:hidden p-2 border-2 border-black rounded-lg bg-[#FFD93D] shadow-[3px_3px_0px_0px_black]"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="w-6 h-6" strokeWidth={2.5} />
                            </button>
                            <div>
                                <h1 className="text-xl lg:text-3xl font-black uppercase italic tracking-tighter" style={{ WebkitTextStroke: '1px black', color: '#4D96FF' }}>
                                    Social Immune System
                                </h1>
                                <p className="text-sm font-bold text-black hidden sm:block bg-black text-white inline-block px-2 transform -rotate-1">
                                    Real-time Elder Wellness Monitoring
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 lg:gap-6">
                            {/* System Status Badge */}
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-black text-[#6BCB77] border-[3px] border-[#6BCB77]">
                                <span className="w-3 h-3 rounded-full bg-[#6BCB77] animate-pulse" />
                                <span className="font-black text-sm uppercase">System Online</span>
                            </div>

                            {/* Clock */}
                            <div className="text-right hidden sm:block bg-[#E0E0E0] p-2 rounded-lg border-2 border-black font-mono">
                                <div className="flex items-center gap-2 text-black leading-none">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-lg font-bold">{formatTime(currentTime)}</span>
                                </div>
                                <p className="text-xs font-bold text-gray-600 mt-1">{formatDate(currentTime)}</p>
                            </div>

                            {/* Notification Bell */}
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                className="relative p-3 rounded-xl bg-white border-[3px] border-black hover:bg-gray-50 transition-colors shadow-[4px_4px_0px_0px_black]"
                            >
                                <Bell className="w-6 h-6 text-black" strokeWidth={2.5} />
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF6B6B] border-2 border-black rounded-full flex items-center justify-center text-xs font-black text-white">
                                    3
                                </span>
                            </motion.button>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                        
                        {/* Left Section - Map & Stats */}
                        <div className="xl:col-span-3 space-y-8">
                            
                            {/* Heatmap Widget */}
                            <NeoCard className="overflow-hidden">
                                <div className="px-6 py-4 border-b-[3px] border-black bg-[#A29BFE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="font-black text-xl text-black uppercase">Community Heatmap</h2>
                                            <p className="text-sm font-bold text-black/70">Real-time Ward Status</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase bg-white/50 p-2 rounded-lg border-2 border-black">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#FF6B6B] border border-black" />
                                            <span>Critical</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#FF9F43] border border-black" />
                                            <span>Warning</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#6BCB77] border border-black" />
                                            <span>Normal</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Placeholder */}
                                <div className="relative h-64 sm:h-80 lg:h-96 bg-white">
                                    {/* Grid pattern overlay */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            backgroundImage: `linear-gradient(#e5e7eb 2px, transparent 2px), linear-gradient(90deg, #e5e7eb 2px, transparent 2px)`,
                                            backgroundSize: '40px 40px',
                                        }}
                                    />

                                    {/* Heatmap Points */}
                                    {heatmapPoints.map((point, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.1, type: "spring" }}
                                            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                                            style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                        >
                                            {/* Pulse effect for critical */}
                                            {point.status === 'critical' && (
                                                <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${getStatusColor(point.status)}`} />
                                            )}
                                            
                                            {/* Main dot */}
                                            <div className={`
                                                relative w-8 h-8 rounded-full ${getStatusColor(point.status)}
                                                flex items-center justify-center
                                                border-[3px] border-black shadow-md
                                                transition-transform duration-200 group-hover:scale-125
                                            `}>
                                                <div className="w-2 h-2 rounded-full bg-black" />
                                            </div>

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1 bg-black text-white border-2 border-white rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                                {point.label}
                                            </div>
                                        </motion.div>
                                    ))}

                                    <div className="absolute bottom-4 left-4 px-4 py-2 bg-white border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_black]">
                                        <span className="font-black text-sm uppercase">📍 National View</span>
                                    </div>
                                </div>
                            </NeoCard>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {/* Total Elders */}
                                <NeoCard color="bg-[#FFD93D]" className="p-6 relative">
                                    <div className="absolute top-4 right-4 opacity-20">
                                        <Users size={64} color="black" />
                                    </div>
                                    <p className="text-sm font-black uppercase mb-2">Total Monitored</p>
                                    <p className="text-5xl font-black text-black">12.8k</p>
                                    <p className="text-sm font-bold mt-2 flex items-center gap-1">
                                        <TrendingDown className="w-4 h-4 rotate-180" />
                                        +142 this week
                                    </p>
                                </NeoCard>

                                {/* Critical Alerts */}
                                <NeoCard color="bg-[#FF6B6B]" className="p-6 text-white relative">
                                    <div className="absolute top-4 right-4 opacity-20">
                                        <AlertTriangle size={64} color="black" />
                                    </div>
                                    <p className="text-sm font-black uppercase mb-2 text-black">Critical Alerts</p>
                                    <p className="text-5xl font-black text-white drop-shadow-[2px_2px_0px_black]" style={{ WebkitTextStroke: '2px black' }}>23</p>
                                    <p className="text-sm font-bold mt-2 flex items-center gap-1 text-black bg-white/50 inline-block px-2 rounded">
                                        <Activity className="w-4 h-4" />
                                        8 pending
                                    </p>
                                </NeoCard>

                                {/* Avg Isolation Score */}
                                <NeoCard color="bg-[#6BCB77]" className="p-6 relative">
                                    <div className="absolute top-4 right-4 opacity-20">
                                        <Heart size={64} color="black" />
                                    </div>
                                    <p className="text-sm font-black uppercase mb-2">Avg. Isolation</p>
                                    <p className="text-5xl font-black text-black">3.2</p>
                                    <p className="text-sm font-bold mt-2 flex items-center gap-1">
                                        <TrendingDown className="w-4 h-4" />
                                        -0.4 (Improving)
                                    </p>
                                </NeoCard>
                            </div>
                        </div>

                        {/* Right Section - Live Feed */}
                        <div className="xl:col-span-2 h-full">
                            <NeoCard className="h-full flex flex-col bg-white">
                                <div className="px-6 py-4 border-b-[3px] border-black bg-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-6 h-6 text-black fill-[#FFD93D]" />
                                        <h2 className="font-black text-xl uppercase">Live Feed</h2>
                                    </div>
                                    <span className="flex items-center gap-2 text-xs font-bold uppercase bg-black text-[#6BCB77] px-3 py-1 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-[#6BCB77] animate-pulse" />
                                        Streaming
                                    </span>
                                </div>

                                {/* Scrollable List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[600px] bg-[#f0f0f0]">
                                    {interventions.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            whileHover={{ x: 4, y: -4, boxShadow: "-4px 4px 0px 0px black" }}
                                            className={`
                                                p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_black]
                                                cursor-pointer transition-all relative overflow-hidden
                                            `}
                                        >
                                            {/* Severity Stripe */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${getStatusColor(item.severity)} border-r-2 border-black`} />

                                            <div className="pl-4 flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-black text-lg text-black">{item.ward}</span>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{item.time}</span>
                                                    </div>
                                                    
                                                    <p className="text-sm font-bold text-[#4D96FF] uppercase mb-1">{item.type}</p>
                                                    <p className="text-sm text-gray-700 font-medium leading-snug">{item.detail}</p>
                                                    
                                                    <div className="mt-3 inline-block bg-black text-white text-xs font-bold px-2 py-1 rounded">
                                                        STATUS: {item.status.toUpperCase()}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* View All Button */}
                                <div className="p-4 border-t-[3px] border-black bg-white">
                                    <button className="w-full py-3 rounded-xl border-2 border-black bg-gray-100 hover:bg-[#FFD93D] hover:shadow-[4px_4px_0px_0px_black] transition-all font-black uppercase text-sm flex items-center justify-center gap-2">
                                        View All Activity
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </NeoCard>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;