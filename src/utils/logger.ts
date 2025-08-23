// src/utils/logger.ts - Système de logging intelligent
interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableStorage: boolean;
  maxStoredLogs: number;
  sensitiveFields: string[];
}

interface LogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  data?: any;
  userId?: string;
}

class Logger {
  private config: LogConfig = {
    level: __DEV__ ? 'debug' : 'warn',
    enableConsole: true,
    enableStorage: false,
    maxStoredLogs: 100,
    sensitiveFields: ['password', 'jwt', 'token', 'email', 'telephone', 'resetPasswordToken']
  };

  private logBuffer: LogEntry[] = [];
  private lastLogMessage: string = '';
  private lastLogCount: number = 1;
  private lastLogTime: number = 0;

  // Filtrer les données sensibles
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = Array.isArray(data) ? [...data] : { ...data };
    
    for (const field of this.config.sensitiveFields) {
      if (field in sanitized) {
        if (typeof sanitized[field] === 'string' && sanitized[field].length > 0) {
          sanitized[field] = sanitized[field].length > 20 
            ? `${sanitized[field].substring(0, 8)}...${sanitized[field].substring(sanitized[field].length - 4)}`
            : '***HIDDEN***';
        } else {
          sanitized[field] = '***HIDDEN***';
        }
      }
    }

    // Récursif pour objets imbriqués
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  // Détecter les logs répétitifs
  private shouldSkipRepetitive(message: string): boolean {
    const now = Date.now();
    const timeDiff = now - this.lastLogTime;

    if (message === this.lastLogMessage && timeDiff < 5000) { // 5 secondes
      this.lastLogCount++;
      if (this.lastLogCount === 2) {
        console.log(`🔄 Message précédent répété ${this.lastLogCount} fois (logs similaires masqués)`);
      }
      return true;
    }

    if (this.lastLogCount > 1) {
      console.log(`🔄 Dernier message répété ${this.lastLogCount} fois au total`);
    }

    this.lastLogMessage = message;
    this.lastLogCount = 1;
    this.lastLogTime = now;
    return false;
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', category: string, message: string, data?: any) {
    // Vérifier le niveau
    const levels = ['debug', 'info', 'warn', 'error'];
    if (levels.indexOf(level) < levels.indexOf(this.config.level)) {
      return;
    }

    // Éviter les répétitions
    const fullMessage = `${category}: ${message}`;
    if (this.shouldSkipRepetitive(fullMessage)) {
      return;
    }

    const sanitizedData = data ? this.sanitizeData(data) : undefined;
    
    // Log console avec emojis
    if (this.config.enableConsole) {
      const emoji = {
        debug: '🐛',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
      }[level];

      const categoryEmoji = this.getCategoryEmoji(category);
      
      if (sanitizedData) {
        console[level](`${emoji} ${categoryEmoji} ${message}`, sanitizedData);
      } else {
        console[level](`${emoji} ${categoryEmoji} ${message}`);
      }
    }

    // Stocker si activé
    if (this.config.enableStorage) {
      this.storeLog({
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        data: sanitizedData
      });
    }
  }

  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      'auth': '🔐',
      'contacts': '👥',
      'sync': '🔄',
      'api': '📡',
      'storage': '💾',
      'navigation': '🧭',
      'performance': '⚡',
      'error': '💥',
      'cache': '📦',
      'invitation': '📨',
      'scan': '📱'
    };
    return emojis[category.toLowerCase()] || '📋';
  }

  private storeLog(entry: LogEntry) {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.config.maxStoredLogs) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxStoredLogs);
    }
  }

  // API publique
  debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log('error', category, message, data);
  }

  // Méthodes utilitaires
  setLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    this.config.level = level;
  }

  enableStorageLogs(enable: boolean = true) {
    this.config.enableStorage = enable;
  }

  getStoredLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearStoredLogs() {
    this.logBuffer = [];
  }

  // Méthodes spécialisées
  performance(category: string, operation: string, duration: number) {
    if (duration > 1000) {
      this.warn('performance', `${category}: ${operation} took ${duration}ms`);
    } else {
      this.debug('performance', `${category}: ${operation} completed in ${duration}ms`);
    }
  }

  startTimer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.performance('timer', label, duration);
    };
  }
}

// Instance singleton
export const logger = new Logger();

// Helpers pour migration facile
export const logAuth = (message: string, data?: any) => logger.info('auth', message, data);
export const logContacts = (message: string, data?: any) => logger.info('contacts', message, data);
export const logSync = (message: string, data?: any) => logger.info('sync', message, data);
export const logError = (category: string, message: string, error?: any) => logger.error(category, message, error);

export default logger;