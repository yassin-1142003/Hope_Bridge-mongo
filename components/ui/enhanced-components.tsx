// components/ui/enhanced-components.tsx - Enhanced UI components with animations
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Enhanced Button Component
interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
}

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    loading = false, 
    success = false,
    error = false,
    icon,
    iconPosition = 'left',
    ripple = true,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const shouldReduceMotion = useReducedMotion();

    const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || shouldReduceMotion) return;

      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple = {
        id: Date.now(),
        x,
        y
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }, [ripple, shouldReduceMotion]);

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    return (
      <motion.button
        ref={buttonRef}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          variants[variant],
          sizes[size],
          (loading || success || error) && "cursor-not-allowed",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        onClick={createRipple}
        whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
        whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.span
              key={ripple.id}
              className="absolute bg-white/30 rounded-full pointer-events-none"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          ))}
        </AnimatePresence>

        {/* Loading state */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          </motion.div>
        )}

        {/* Success state */}
        {success && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-green-600"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}

        {/* Error state */}
        {error && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-red-600"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        )}

        {/* Button content */}
        <span className={cn("flex items-center gap-2", (loading || success || error) && "opacity-0")}>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </span>
      </motion.button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

// Enhanced Card Component
interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
  gradient?: boolean;
  animated?: boolean;
}

export const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, hover = true, glass = false, gradient = false, animated = false, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const cardVariants = {
      initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: shouldReduceMotion ? 0 : -20 }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          glass && "bg-white/10 backdrop-blur-md border-white/20",
          gradient && "bg-gradient-to-br from-white/20 to-white/5",
          className
        )}
        variants={animated ? cardVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
        exit={animated ? "exit" : undefined}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
        whileHover={hover && !shouldReduceMotion ? { scale: 1.02 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

// Enhanced Input Component
interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  animated?: boolean;
}

export const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, label, error, helper, icon, animated = true, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [filled, setFilled] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (inputRef.current) {
        setFilled(!!inputRef.current.value);
      }
    }, [props.value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilled(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        {label && (
          <motion.label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            animate={{ color: error ? "rgb(239 68 68)" : focused ? "rgb(59 130 246)" : "rgb(107 114 128)" }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {icon && (
            <motion.div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              animate={{ color: focused ? "rgb(59 130 246)" : "rgb(156 163 175)" }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
          
          <motion.input
            ref={inputRef}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error && "border-red-500 focus-visible:ring-red-500",
              className
            )}
            animate={{
              borderColor: error ? "rgb(239 68 68)" : focused ? "rgb(59 130 246)" : "rgb(229 231 235)",
              boxShadow: focused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none"
            }}
            transition={{ duration: 0.2 }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            ref={ref}
            {...props}
          />
          
          {animated && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-blue-500 origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: focused ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
        
        {(error || helper) && (
          <motion.p
            className={cn("text-xs", error ? "text-red-500" : "text-gray-500")}
            animate={{ opacity: 1, height: "auto" }}
            initial={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error || helper}
          </motion.p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

// Enhanced Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'bars';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  variant = 'default' 
}) => {
  const shouldReduceMotion = useReducedMotion();

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (variant === 'dots') {
    return (
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("rounded-full bg-current", sizes[size])}
            animate={!shouldReduceMotion ? {
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            } : {}}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1
            }}
            style={{ color }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn("rounded-full border-2 border-t-transparent", sizes[size])}
        style={{ borderColor: color, borderTopColor: 'transparent' }}
        animate={!shouldReduceMotion ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    );
  }

  if (variant === 'bars') {
    return (
      <div className="flex gap-1 items-end">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-current rounded-full"
            style={{ 
              color,
              height: size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px'
            }}
            animate={!shouldReduceMotion ? {
              height: ['25%', '100%', '25%']
            } : {}}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    );
  }

  // Default spinner
  return (
    <motion.div
      className={cn("border-2 border-t-transparent rounded-full", sizes[size])}
      style={{ borderColor: color, borderTopColor: 'transparent' }}
      animate={!shouldReduceMotion ? { rotate: 360 } : {}}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

// Enhanced Alert Component
interface EnhancedAlertProps {
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  title?: string;
  description?: string;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const EnhancedAlert: React.FC<EnhancedAlertProps> = ({
  variant = 'default',
  title,
  description,
  closable = false,
  onClose,
  className,
  children
}) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const variants = {
    default: "bg-background text-foreground border-border",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    success: "bg-green-50 text-green-800 border-green-200",
    info: "bg-blue-50 text-blue-800 border-blue-200"
  };

  const icons = {
    default: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    destructive: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    warning: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    success: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    info: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn(
            "relative w-full rounded-lg border p-4",
            variants[variant],
            className
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {icons[variant]}
            </div>
            
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className="text-sm font-semibold mb-1">{title}</h4>
              )}
              {description && (
                <p className="text-sm opacity-90">{description}</p>
              )}
              {children}
            </div>
            
            {closable && (
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
                aria-label="Close notification"
                title="Close notification"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Enhanced Badge Component
interface EnhancedBadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  pulse?: boolean;
  dot?: boolean;
}

export const EnhancedBadge: React.FC<EnhancedBadgeProps & React.HTMLAttributes<HTMLSpanElement>> = ({
  variant = 'default',
  size = 'md',
  animated = true,
  pulse = false,
  dot = false,
  className,
  children,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-input bg-background text-foreground",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-white"
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base"
  };

  if (dot) {
    return (
      <motion.span
        className={cn(
          "inline-block rounded-full",
          variant === 'success' ? "bg-green-500" :
          variant === 'warning' ? "bg-yellow-500" :
          variant === 'destructive' ? "bg-red-500" : "bg-primary",
          size === 'sm' ? "w-2 h-2" : size === 'md' ? "w-2.5 h-2.5" : "w-3 h-3",
          className
        )}
        animate={pulse && !shouldReduceMotion ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        {...props}
      />
    );
  }

  return (
    <motion.span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variants[variant],
        sizes[size],
        className
      )}
      initial={animated ? { scale: 0, opacity: 0 } : undefined}
      animate={animated ? { scale: 1, opacity: 1 } : undefined}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      {...props}
    >
      {children}
    </motion.span>
  );
};
