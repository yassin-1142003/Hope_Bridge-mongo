/**
 * 📊 AWESOME CHART COMPONENT
 * 
 * Mind-blowing charts with glassmorphism, gradient animations,
 * and interactive effects that will leave you speechless!
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Zap,
  Rocket,
  Star,
  Crown,
  Diamond,
  Flame,
  Sparkles,
  Target,
  Award,
  Trophy
} from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: any;
}

interface AwesomeChartProps {
  data: ChartData[];
  type: 'bar' | 'line' | 'pie' | 'radar';
  title: string;
  subtitle?: string;
  className?: string;
}

const AwesomeChart: React.FC<AwesomeChartProps> = ({
  data,
  type,
  title,
  subtitle,
  className = ''
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const controls = useAnimation();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 🎨 Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));

  // 🎨 Get Tailwind color class for dynamic colors
  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#8b5cf6': 'bg-purple-500',
      '#ec4899': 'bg-pink-500',
      '#3b82f6': 'bg-blue-500',
      '#10b981': 'bg-green-500',
      '#f59e0b': 'bg-yellow-500',
      '#ef4444': 'bg-red-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  // 🌟 Render Bar Chart
  const renderBarChart = () => (
    <div className="space-y-4">
      {data.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
          className="relative"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {item.icon && (
                <motion.div
                  animate={{ rotate: hoveredIndex === index ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon className="w-4 h-4 text-gray-600" />
                </motion.div>
              )}
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">{item.value}</span>
              {item.trend && (
                <motion.div
                  animate={{ 
                    y: item.trend === 'up' ? -2 : item.trend === 'down' ? 2 : 0,
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {item.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : item.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <Activity className="w-4 h-4 text-gray-500" />
                  )}
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxValue) * 100}%` }}
              transition={{ 
                duration: 1, 
                delay: index * 0.2,
                ease: "easeOut"
              }}
              className="h-full rounded-full relative overflow-hidden"
              style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)` }}
            >
              {/* 🌟 Animated shimmer effect */}
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
              
              {/* ✨ Hover glow effect */}
              {hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // 🎨 Render Pie Chart
  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 256 256" className="w-full h-full">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const endAngle = currentAngle + angle;
              
              const startX = 128 + 120 * Math.cos((currentAngle * Math.PI) / 180);
              const startY = 128 + 120 * Math.sin((currentAngle * Math.PI) / 180);
              const endX = 128 + 120 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 128 + 120 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 128 128`,
                `L ${startX} ${startY}`,
                `A 120 120 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                'Z'
              ].join(' ');
              
              currentAngle = endAngle;
              
              return (
                <motion.path
                  key={item.label}
                  d={pathData}
                  fill={item.color}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    filter: 'brightness(1.1)',
                    origin: '128px 128px'
                  }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                />
              );
            })}
          </svg>
          
          {/* 🎯 Center decoration */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <PieChart className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>
          
          {/* 🌟 Hover tooltip */}
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl rounded-xl p-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full ${getColorClass(data[hoveredIndex]?.color || '#8b5cf6')}`}
                />
                <div>
                  <p className="font-semibold text-gray-800">{data[hoveredIndex].label}</p>
                  <p className="text-sm text-gray-600">{data[hoveredIndex].value}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  // 🎨 Render Line Chart
  const renderLineChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-64">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* 🌟 Grid lines */}
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * 25}
              x2="100"
              y2={i * 25}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="0.5"
            />
          ))}
          
          {/* 🎨 Animated line */}
          <motion.polyline
            points={points}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* 🌟 Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          
          {/* 🎯 Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item.value / maxValue) * 100;
            
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={item.color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 2 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={`p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl ${className}`}
    >
      {/* 🎯 Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </motion.div>
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-white/60 mt-1">{subtitle}</p>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl"
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
        </motion.button>
      </div>
      
      {/* 🎨 Chart Content */}
      <div className="min-h-[200px]">
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {type === 'line' && renderLineChart()}
      </div>
      
      {/* 🌟 Sparkle Effects */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
            y: [Math.random() * 100 - 50, Math.random() * 100 - 50]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            delay: Math.random() * 5
          }}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full pointer-events-none"
        />
      ))}
    </motion.div>
  );
};

export default AwesomeChart;
