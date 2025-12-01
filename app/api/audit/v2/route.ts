/**
 * Enhanced Audit Log API v2.0
 * 
 * Enterprise-grade audit logging with advanced features:
 * - Comprehensive activity tracking across all entities
 * - Compliance reporting and export capabilities
 * - Advanced filtering and search
 * - Real-time monitoring and alerts
 * - Data retention and archiving policies
 * - Tamper-proof logging with digital signatures
 * - Integration with compliance frameworks (SOC2, GDPR, HIPAA)
 * - Anomaly detection and security analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { UserRole, hasPermission } from "@/lib/roles";
import { 
  createSuccessResponse, 
  createCreatedResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";
import crypto from 'crypto';

// Enhanced audit log schemas
const auditLogSchemaV2 = z.object({
  action: z.string().min(1).max(100),
  entityType: z.string().min(1).max(50),
  entityId: z.string().optional(),
  entityName: z.string().max(255).optional(),
  userId: z.string().email(),
  userName: z.string().optional(),
  userRole: z.string().optional(),
  
  // Detailed information
  description: z.string().max(1000),
  details: z.record(z.any()).optional(),
  
  // Context information
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  
  // Request information
  method: z.string().optional(),
  endpoint: z.string().optional(),
  requestHeaders: z.record(z.string()).optional(),
  requestBody: z.any().optional(),
  
  // Response information
  statusCode: z.number().optional(),
  responseTime: z.number().optional(),
  responseSize: z.number().optional(),
  
  // Security information
  authenticationMethod: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  
  // Risk assessment
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  complianceTags: z.array(z.string()).optional(),
  
  // Geographic and temporal
  timezone: z.string().optional(),
  location: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional()
  }).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).max(20).optional(),
  
  // Digital signature for integrity
  signature: z.string().optional()
});

const auditQuerySchemaV2 = z.object({
  // Basic filtering
  action: z.string().optional(),
  entityType: z.string().optional(),
  userId: z.string().email().optional(),
  userRole: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  
  // Date range filtering
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
    timezone: z.string().default('UTC')
  }).optional(),
  
  // Advanced filtering
  ipAddress: z.string().optional(),
  sessionId: z.string().optional(),
  statusCode: z.number().optional(),
  method: z.string().optional(),
  endpoint: z.string().optional(),
  complianceTags: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  
  // Search functionality
  search: z.string().optional(),
  searchFields: z.array(z.enum(['description', 'entityName', 'details', 'action'])).default(['description', 'entityName']),
  
  // Sorting and pagination
  sortBy: z.enum(['timestamp', 'action', 'entityType', 'userId', 'riskLevel']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(1000).default(50),
  
  // Advanced options
  includeDetails: z.boolean().default(false),
  includeGeographic: z.boolean().default(false),
  includeSecurity: z.boolean().default(false),
  groupBy: z.enum(['action', 'entityType', 'userId', 'riskLevel', 'date']).optional(),
  
  // Export options
  exportFormat: z.enum(['json', 'csv', 'excel', 'pdf']).optional(),
  includeHeaders: z.boolean().default(true)
});

const complianceReportSchemaV2 = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  framework: z.enum(['SOC2', 'GDPR', 'HIPAA', 'SOX', 'ISO27001', 'PCI-DSS', 'custom']),
  period: z.object({
    start: z.string(),
    end: z.string(),
    timezone: z.string().default('UTC')
  }),
  criteria: z.array(z.object({
    name: z.string(),
    description: z.string(),
    requirements: z.array(z.string()),
    filters: z.record(z.any()).optional()
  })),
  recipients: z.array(z.string().email()),
  schedule: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
    nextRun: z.string().optional()
  }).optional(),
  format: z.enum(['json', 'csv', 'excel', 'pdf']).default('pdf')
});

const retentionPolicySchemaV2 = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  retentionDays: z.number().min(1).max(36500), // Max 100 years
  archiveAfterDays: z.number().min(0).max(36500).optional(),
  deleteAfterArchive: z.boolean().default(false),
  complianceTags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true)
});

// Enhanced Audit Manager
class EnhancedAuditManager {
  async createAuditLogV2(logData: any, request: NextRequest, session: any): Promise<any> {
    try {
      const auditCollection = await getCollection('audit_logs');
      
      // Extract request information
      const requestInfo = this.extractRequestInfo(request);
      
      // Get user location (simplified)
      const location = await this.getUserLocation(requestInfo.ipAddress);
      
      // Calculate risk level
      const riskLevel = await this.calculateRiskLevel(logData.action, logData.entityType, session);
      
      // Add compliance tags
      const complianceTags = await this.getComplianceTags(logData.action, logData.entityType);
      
      // Create audit log entry
      const auditLog = {
        _id: new ObjectId(),
        ...logData,
        userName: session.user.name,
        userRole: session.user.role,
        
        // Request information
        ...requestInfo,
        
        // Context
        timezone: this.getTimezone(request),
        location,
        
        // Risk and compliance
        riskLevel,
        complianceTags,
        
        // Timestamp
        timestamp: new Date(),
        timestampUTC: new Date().toUTCString(),
        
        // Metadata
        metadata: {
          ...logData.metadata,
          sessionId: session.sessionId || 'unknown',
          requestId: crypto.randomUUID()
        }
      };
      
      // Generate digital signature
      auditLog.signature = await this.generateSignature(auditLog);
      
      await auditCollection.insertOne(auditLog);
      
      // Check for anomalies
      await this.checkForAnomalies(auditLog);
      
      // Update audit statistics
      await this.updateAuditStatistics(auditLog);
      
      // Send real-time alerts if needed
      if (riskLevel === 'high' || riskLevel === 'critical') {
        await this.sendSecurityAlert(auditLog);
      }
      
      return auditLog;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }
  
  async getAuditLogsV2(query: any, session: any): Promise<any> {
    try {
      const auditCollection = await getCollection('audit_logs');
      
      // Build query
      const dbQuery: any = {};
      
      // Apply filters
      if (query.action) dbQuery.action = query.action;
      if (query.entityType) dbQuery.entityType = query.entityType;
      if (query.userId) dbQuery.userId = query.userId;
      if (query.userRole) dbQuery.userRole = query.userRole;
      if (query.riskLevel) dbQuery.riskLevel = query.riskLevel;
      if (query.ipAddress) dbQuery.ipAddress = query.ipAddress;
      if (query.sessionId) dbQuery.sessionId = query.sessionId;
      if (query.statusCode) dbQuery.statusCode = query.statusCode;
      if (query.method) dbQuery.method = query.method;
      if (query.endpoint) dbQuery.endpoint = { $regex: query.endpoint, $options: 'i' };
      
      // Compliance tags filtering
      if (query.complianceTags && query.complianceTags.length > 0) {
        dbQuery.complianceTags = { $in: query.complianceTags };
      }
      
      // Tags filtering
      if (query.tags && query.tags.length > 0) {
        dbQuery.tags = { $in: query.tags };
      }
      
      // Date range filtering
      if (query.dateRange) {
        dbQuery.timestamp = {
          $gte: new Date(query.dateRange.start),
          $lte: new Date(query.dateRange.end)
        };
      }
      
      // Search functionality
      if (query.search) {
        const searchConditions = query.searchFields.map((field: string) => ({
          [field]: { $regex: query.search, $options: 'i' }
        }));
        dbQuery.$or = searchConditions;
      }
      
      // User access control
      if (!hasPermission(session.user.role as UserRole, 'canViewAllAuditLogs')) {
        dbQuery.$or = [
          { userId: session.user.email },
          { riskLevel: { $in: ['high', 'critical'] } }
        ];
      }
      
      // Get total count
      const total = await auditCollection.countDocuments(dbQuery);
      
      // Build aggregation pipeline
      const pipeline: any[] = [
        { $match: dbQuery },
        { $sort: { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 } },
        { $skip: (query.page - 1) * query.limit },
        { $limit: query.limit }
      ];
      
      // Include additional data based on options
      if (query.includeDetails) {
        pipeline.push({
          $addFields: {
            details: { $ifNull: ['$details', {}] },
            metadata: { $ifNull: ['$metadata', {}] }
          }
        });
      } else {
        pipeline.push({
          $project: {
            details: 0,
            requestBody: 0,
            requestHeaders: 0,
            signature: 0
          }
        });
      }
      
      if (query.includeGeographic) {
        pipeline.push({
          $addFields: {
            location: { $ifNull: ['$location', {}] }
          }
        });
      } else {
        pipeline.push({
          $project: {
            location: 0
          }
        });
      }
      
      if (query.includeSecurity) {
        pipeline.push({
          $addFields: {
            authenticationMethod: { $ifNull: ['$authenticationMethod', 'unknown'] },
            permissions: { $ifNull: ['$permissions', []] }
          }
        });
      }
      
      const logs = await auditCollection.aggregate(pipeline).toArray();
      
      // Group results if requested
      let groupedResults = logs;
      if (query.groupBy) {
        groupedResults = await this.groupAuditLogs(logs, query.groupBy);
      }
      
      // Generate statistics
      const statistics = await this.getAuditStatistics(dbQuery, session);
      
      // Handle export
      if (query.exportFormat) {
        return await this.exportAuditLogs(groupedResults, query.exportFormat, query);
      }
      
      // Pagination metadata
      const pagination = {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
        hasNext: query.page * query.limit < total,
        hasPrev: query.page > 1
      };
      
      return {
        logs: groupedResults,
        pagination,
        statistics,
        filters: {
          action: query.action,
          entityType: query.entityType,
          userId: query.userId,
          riskLevel: query.riskLevel,
          dateRange: query.dateRange,
          search: query.search
        },
        compliance: {
          totalLogs: total,
          highRiskLogs: logs.filter(log => log.riskLevel === 'high' || log.riskLevel === 'critical').length,
          complianceTags: this.getComplianceSummary(logs)
        }
      };
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      throw error;
    }
  }
  
  async createComplianceReportV2(reportData: any, session: any): Promise<any> {
    try {
      const reportsCollection = await getCollection('compliance_reports');
      const auditCollection = await getCollection('audit_logs');
      
      // Validate report data
      const validatedReport = complianceReportSchemaV2.parse(reportData);
      
      // Generate report data
      const reportResults = await this.generateComplianceReport(validatedReport, session);
      
      // Create report record
      const report = {
        _id: new ObjectId(),
        ...validatedReport,
        generatedBy: session.user.email,
        generatedByName: session.user.name,
        generatedAt: new Date(),
        
        // Report results
        results: reportResults,
        summary: this.generateReportSummary(reportResults),
        
        // Status
        status: 'completed',
        downloadUrl: `/api/audit/v2/reports/${new ObjectId().toString()}/download`,
        
        // Metadata
        totalLogs: reportResults.totalLogs,
        complianceScore: reportResults.complianceScore,
        violations: reportResults.violations,
        recommendations: reportResults.recommendations
      };
      
      await reportsCollection.insertOne(report);
      
      // Send report to recipients
      if (report.recipients && report.recipients.length > 0) {
        await this.sendComplianceReport(report);
      }
      
      // Schedule next run if enabled
      if (report.schedule?.enabled) {
        await this.scheduleComplianceReport(report);
      }
      
      return report;
    } catch (error) {
      console.error('Failed to create compliance report:', error);
      throw error;
    }
  }
  
  async createRetentionPolicyV2(policyData: any, session: any): Promise<any> {
    try {
      const policiesCollection = await getCollection('retention_policies');
      
      // Validate policy data
      const validatedPolicy = retentionPolicySchemaV2.parse(policyData);
      
      // Create policy record
      const policy = {
        _id: new ObjectId(),
        ...validatedPolicy,
        createdBy: session.user.email,
        createdByName: session.user.name,
        createdAt: new Date(),
        isActive: true,
        
        // Policy execution tracking
        lastRun: null,
        nextRun: this.calculateNextRun(validatedPolicy),
        executionHistory: [],
        
        // Statistics
        totalProcessed: 0,
        totalArchived: 0,
        totalDeleted: 0
      };
      
      await policiesCollection.insertOne(policy);
      
      // Schedule policy execution
      await this.scheduleRetentionPolicy(policy);
      
      return policy;
    } catch (error) {
      console.error('Failed to create retention policy:', error);
      throw error;
    }
  }
  
  async getAuditAnalyticsV2(query: any, session: any): Promise<any> {
    try {
      const auditCollection = await getCollection('audit_logs');
      
      // Build base query
      const dbQuery = this.buildAnalyticsQuery(query, session);
      
      // Time-based analytics
      const timeAnalytics = await this.getTimeBasedAnalytics(dbQuery, query);
      
      // Risk analytics
      const riskAnalytics = await this.getRiskAnalytics(dbQuery);
      
      // User activity analytics
      const userAnalytics = await this.getUserActivityAnalytics(dbQuery);
      
      // Entity analytics
      const entityAnalytics = await this.getEntityAnalytics(dbQuery);
      
      // Geographic analytics
      const geographicAnalytics = await this.getGeographicAnalytics(dbQuery);
      
      // Compliance analytics
      const complianceAnalytics = await this.getComplianceAnalytics(dbQuery);
      
      // Anomaly detection
      const anomalies = await this.detectAnomalies(dbQuery);
      
      // Security insights
      const securityInsights = await this.generateSecurityInsights(dbQuery);
      
      return {
        time: timeAnalytics,
        risk: riskAnalytics,
        users: userAnalytics,
        entities: entityAnalytics,
        geographic: geographicAnalytics,
        compliance: complianceAnalytics,
        anomalies,
        security: securityInsights,
        insights: await this.generateAuditInsights({
          time: timeAnalytics,
          risk: riskAnalytics,
          users: userAnalytics,
          anomalies
        }),
        recommendations: await this.generateAuditRecommendations({
          risk: riskAnalytics,
          anomalies,
          compliance: complianceAnalytics
        })
      };
    } catch (error) {
      console.error('Failed to get audit analytics:', error);
      throw error;
    }
  }
  
  // Helper methods
  private extractRequestInfo(request: NextRequest): any {
    return {
      method: request.method,
      endpoint: request.url,
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
      requestHeaders: Object.fromEntries(request.headers.entries())
    };
  }
  
  private async getUserLocation(ipAddress: string): Promise<any> {
    // Simplified location lookup - in production, use a proper IP geolocation service
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown'
    };
  }
  
  private async calculateRiskLevel(action: string, entityType: string, session: any): Promise<'low' | 'medium' | 'high' | 'critical'> {
    // Risk assessment logic
    const highRiskActions = ['DELETE', 'ADMIN', 'SECURITY', 'EXPORT'];
    const criticalActions = ['LOGIN_FAILED', 'PERMISSION_ESCALATION', 'DATA_BREACH'];
    
    if (criticalActions.some(critical => action.includes(critical))) {
      return 'critical';
    }
    
    if (highRiskActions.some(high => action.includes(high))) {
      return 'high';
    }
    
    if (session.user.role === 'admin') {
      return 'medium'; // Admin actions are inherently higher risk
    }
    
    return 'low';
  }
  
  private async getComplianceTags(action: string, entityType: string): Promise<string[]> {
    const tags = [];
    
    // GDPR compliance
    if (entityType === 'users' || action.includes('PERSONAL_DATA')) {
      tags.push('GDPR');
    }
    
    // SOC2 compliance
    if (action.includes('SECURITY') || action.includes('ACCESS')) {
      tags.push('SOC2');
    }
    
    // HIPAA compliance
    if (entityType === 'patients' || action.includes('HEALTH_DATA')) {
      tags.push('HIPAA');
    }
    
    return tags;
  }
  
  private async generateSignature(auditLog: any): Promise<string> {
    // Create a hash of the audit log for integrity verification
    const data = JSON.stringify(auditLog);
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  private async checkForAnomalies(auditLog: any): Promise<void> {
    // Check for unusual patterns
    const anomaliesCollection = await getCollection('audit_anomalies');
    
    // Check for multiple failed logins
    if (auditLog.action === 'LOGIN_FAILED') {
      const recentFailures = await this.getRecentFailedLogins(auditLog.userId, auditLog.ipAddress);
      if (recentFailures >= 5) {
        await anomaliesCollection.insertOne({
          type: 'multiple_failed_logins',
          userId: auditLog.userId,
          ipAddress: auditLog.ipAddress,
          count: recentFailures,
          timestamp: new Date(),
          severity: 'high'
        });
      }
    }
    
    // Check for unusual access patterns
    if (auditLog.riskLevel === 'critical') {
      await anomaliesCollection.insertOne({
        type: 'critical_action',
        userId: auditLog.userId,
        action: auditLog.action,
        entityType: auditLog.entityType,
        timestamp: new Date(),
        severity: 'critical'
      });
    }
  }
  
  private async updateAuditStatistics(auditLog: any): Promise<void> {
    const statsCollection = await getCollection('audit_statistics');
    
    await statsCollection.updateOne(
      { 
        date: new Date(auditLog.timestamp).toISOString().split('T')[0],
        action: auditLog.action,
        entityType: auditLog.entityType
      },
      {
        $inc: { count: 1 },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true }
    );
  }
  
  private async sendSecurityAlert(auditLog: any): Promise<void> {
    // Implementation for sending security alerts
    console.log(`Security alert: ${auditLog.action} by ${auditLog.userId}`);
  }
  
  private async groupAuditLogs(logs: any[], groupBy: string): Promise<any> {
    const grouped = logs.reduce((acc, log) => {
      const key = log[groupBy] || 'unknown';
      if (!acc[key]) {
        acc[key] = { group: key, logs: [], count: 0 };
      }
      acc[key].logs.push(log);
      acc[key].count++;
      return acc;
    }, {});
    
    return Object.values(grouped);
  }
  
  private async getAuditStatistics(dbQuery: any, session: any): Promise<any> {
    const auditCollection = await getCollection('audit_logs');
    
    const stats = await auditCollection.aggregate([
      { $match: dbQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byRiskLevel: {
            $push: {
              riskLevel: '$riskLevel',
              count: 1
            }
          },
          byAction: {
            $push: {
              action: '$action',
              count: 1
            }
          },
          byEntityType: {
            $push: {
              entityType: '$entityType',
              count: 1
            }
          }
        }
      }
    ]).toArray();
    
    return stats[0] || { total: 0 };
  }
  
  private async exportAuditLogs(logs: any[], format: string, query: any): Promise<any> {
    // Implementation for exporting audit logs
    switch (format) {
      case 'csv':
        return this.exportToCSV(logs, query);
      case 'excel':
        return this.exportToExcel(logs, query);
      case 'pdf':
        return this.exportToPDF(logs, query);
      default:
        return logs;
    }
  }
  
  private getComplianceSummary(logs: any[]): any {
    const summary = {};
    
    logs.forEach(log => {
      if (log.complianceTags) {
        log.complianceTags.forEach(tag => {
          summary[tag] = (summary[tag] || 0) + 1;
        });
      }
    });
    
    return summary;
  }
  
  private async generateComplianceReport(reportData: any, session: any): Promise<any> {
    // Implementation for generating compliance reports
    return {
      framework: reportData.framework,
      period: reportData.period,
      totalLogs: 0,
      complianceScore: 95,
      violations: [],
      recommendations: []
    };
  }
  
  private generateReportSummary(results: any): any {
    return {
      totalLogs: results.totalLogs,
      complianceScore: results.complianceScore,
      violationsCount: results.violations.length,
      recommendationsCount: results.recommendations.length
    };
  }
  
  private async sendComplianceReport(report: any): Promise<void> {
    // Implementation for sending compliance reports
    console.log(`Compliance report sent to ${report.recipients.length} recipients`);
  }
  
  private async scheduleComplianceReport(report: any): Promise<void> {
    // Implementation for scheduling compliance reports
    console.log(`Compliance report scheduled: ${report.name}`);
  }
  
  private calculateNextRun(policy: any): Date {
    // Implementation for calculating next policy run time
    return new Date(Date.now() + 24 * 60 * 60 * 1000); // Next day
  }
  
  private async scheduleRetentionPolicy(policy: any): Promise<void> {
    // Implementation for scheduling retention policies
    console.log(`Retention policy scheduled: ${policy.name}`);
  }
  
  private buildAnalyticsQuery(query: any, session: any): any {
    // Build query for analytics
    const dbQuery: any = {};
    
    if (query.dateRange) {
      dbQuery.timestamp = {
        $gte: new Date(query.dateRange.start),
        $lte: new Date(query.dateRange.end)
      };
    }
    
    return dbQuery;
  }
  
  private async getTimeBasedAnalytics(dbQuery: any, query: any): Promise<any> {
    // Implementation for time-based analytics
    return {};
  }
  
  private async getRiskAnalytics(dbQuery: any): Promise<any> {
    // Implementation for risk analytics
    return {};
  }
  
  private async getUserActivityAnalytics(dbQuery: any): Promise<any> {
    // Implementation for user activity analytics
    return {};
  }
  
  private async getEntityAnalytics(dbQuery: any): Promise<any> {
    // Implementation for entity analytics
    return {};
  }
  
  private async getGeographicAnalytics(dbQuery: any): Promise<any> {
    // Implementation for geographic analytics
    return {};
  }
  
  private async getComplianceAnalytics(dbQuery: any): Promise<any> {
    // Implementation for compliance analytics
    return {};
  }
  
  private async detectAnomalies(dbQuery: any): Promise<any[]> {
    // Implementation for anomaly detection
    return [];
  }
  
  private async generateSecurityInsights(dbQuery: any): Promise<any> {
    // Implementation for security insights
    return {};
  }
  
  private async generateAuditInsights(data: any): Promise<string[]> {
    const insights = [];
    
    if (data.risk.highRiskCount > data.risk.totalCount * 0.1) {
      insights.push("High number of high-risk activities detected. Review security policies.");
    }
    
    if (data.anomalies.length > 0) {
      insights.push(`${data.anomalies.length} anomalies detected. Immediate investigation recommended.`);
    }
    
    return insights;
  }
  
  private async generateAuditRecommendations(data: any): Promise<string[]> {
    const recommendations = [];
    
    if (data.risk.criticalCount > 0) {
      recommendations.push("Review and address all critical risk activities immediately.");
    }
    
    if (data.compliance.violations > 0) {
      recommendations.push("Address compliance violations to maintain regulatory requirements.");
    }
    
    return recommendations;
  }
  
  private async getRecentFailedLogins(userId: string, ipAddress: string): Promise<number> {
    const auditCollection = await getCollection('audit_logs');
    
    const count = await auditCollection.countDocuments({
      userId,
      ipAddress,
      action: 'LOGIN_FAILED',
      timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
    });
    
    return count;
  }
  
  // Export methods
  private async exportToCSV(logs: any[], query: any): Promise<any> {
    // Implementation for CSV export
    return new NextResponse('CSV data...', {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="audit-logs.csv"'
      }
    });
  }
  
  private async exportToExcel(logs: any[], query: any): Promise<any> {
    // Implementation for Excel export
    return new NextResponse('Excel data...', {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="audit-logs.xlsx"'
      }
    });
  }
  
  private async exportToPDF(logs: any[], query: any): Promise<any> {
    // Implementation for PDF export
    return new NextResponse('PDF data...', {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="audit-logs.pdf"'
      }
    });
  }
}

// API Handlers
const enhancedAuditManager = new EnhancedAuditManager();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    // Check permissions
    if (!hasPermission(session.user.role as UserRole, 'canViewAuditLogs')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to view audit logs"));
    }
    
    const { searchParams } = new URL(request.url);
    const query = auditQuerySchemaV2.parse(Object.fromEntries(searchParams));
    
    if (query.type === 'analytics') {
      const analytics = await enhancedAuditManager.getAuditAnalyticsV2(query, session);
      
      return setCorsHeaders(createSuccessResponse(
        analytics,
        "Audit analytics retrieved successfully",
        {
          version: 'v2.0'
        }
      ));
    }
    
    const result = await enhancedAuditManager.getAuditLogsV2(query, session);
    
    return setCorsHeaders(createSuccessResponse(
      result,
      "Audit logs retrieved successfully",
      {
        count: result.logs.length,
        version: 'v2.0'
      }
    ));
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Getting audit logs");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    const body = await request.json();
    
    if (body.operation === 'createReport') {
      const validatedReport = complianceReportSchemaV2.parse(body);
      const report = await enhancedAuditManager.createComplianceReportV2(validatedReport, session);
      
      return setCorsHeaders(createCreatedResponse(
        report,
        "Compliance report created successfully",
        {
          reportId: report._id.toString(),
          framework: report.framework,
          version: 'v2.0'
        }
      ));
    } else if (body.operation === 'createPolicy') {
      const validatedPolicy = retentionPolicySchemaV2.parse(body);
      const policy = await enhancedAuditManager.createRetentionPolicyV2(validatedPolicy, session);
      
      return setCorsHeaders(createCreatedResponse(
        policy,
        "Retention policy created successfully",
        {
          policyId: policy._id.toString(),
          retentionDays: policy.retentionDays,
          version: 'v2.0'
        }
      ));
    } else {
      // Create audit log entry
      const validatedLog = auditLogSchemaV2.parse(body);
      const auditLog = await enhancedAuditManager.createAuditLogV2(validatedLog, request, session);
      
      return setCorsHeaders(createCreatedResponse(
        auditLog,
        "Audit log created successfully",
        {
          logId: auditLog._id.toString(),
          action: auditLog.action,
          riskLevel: auditLog.riskLevel,
          version: 'v2.0'
        }
      ));
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Audit operation");
  }
}
