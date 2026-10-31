/**
 * GCVE BCP-06 GNA (GCVE Numbering Authority) Conformance JSON 生成・管理モジュール
 * 【設計制約】完全ブラウザ完結（Static & Client-side Only）
 * サーバー通信を行わず、クライアントサイドの純粋なロジックとして動作します。
 */

export interface GnaProfile {
  gcveBcpVersion: string; // 例: "BCP-06-1.0"
  gnaId: string;          // 例: "65535"
  lastUpdated: string;    // 例: "2026-02-12"

  governance: {
    hasPublicDisclosurePolicy: boolean;
    disclosurePolicyUrl: string;
    disclosurePolicyLastUpdated: string;
    hasSecurityContact: boolean;
    securityContactType: string; // 例: "email"
    securityContactPgpAvailable: boolean;
    operatorPubliclyIdentified: boolean;
    scopeDefined: boolean;
    conflictOfInterestStatement: boolean;
  };

  disclosureProcess: {
    disclosureModel: "immediate_full_disclosure" | "coordinated_disclosure" | "partial";
    supportsEmbargoProcess: boolean;
    embargoPolicyPublic: boolean;
    averageEmbargoDurationDays: number;
    humanReviewRequired: boolean;
    automatedAllocation: boolean;
    reviewSlaDays: number;
  };

  allocationQuality: {
    identifierReuseDetected: boolean;
    identifierReassignmentDetected: boolean;
    usesPermalinks: boolean;
    referenceHttp200Ratio: number;
    referenceHttp404Ratio: number;
    averageDescriptionLength: number;
    hasCweClassification: boolean;
    hasCvssScore: boolean;
    hasEpssScore: boolean;
    hasVendorAcknowledgement: boolean;
    averageFieldsPerRecord: number;
  };

  interoperability: {
    providesMachineReadableFeed: boolean;
    feedFormat: string[]; // 例: ["json"]
    schemaVersionDeclared: boolean;
    usesCwe: boolean;
    usesCvss: boolean;
    usesOpenvex: boolean;
    usesOssfSchema: boolean;
  };

  synchronization: {
    providesSyncEndpoint: boolean;
    syncEndpointUrl: string;
    syncProtocolVersion: string;
    lastSuccessfulSync: string; // 例: "2026-02-11T14:10:00Z"
    syncUptimeRatio30d: number;
    averageSyncLatencySeconds: number;
  };

  evaluationMetadata: {
    evaluationVersion: string;
    lastEvaluated: string;
    overallScore: number;
  };
}

/**
 * GnaProfileからご提示いただいたサンプルに基づくBCP-06準拠のConformance JSONオブジェクトを生成する
 */
export function generateGnaConformanceJson(profile: GnaProfile): object {
  return {
    gcve_bcp_version: profile.gcveBcpVersion || "BCP-06-1.0",
    gna_id: profile.gnaId.trim(),
    last_updated: profile.lastUpdated || new Date().toISOString().split("T")[0],

    governance: {
      has_public_disclosure_policy: profile.governance.hasPublicDisclosurePolicy,
      disclosure_policy_url: profile.governance.disclosurePolicyUrl.trim(),
      disclosure_policy_last_updated: profile.governance.disclosurePolicyLastUpdated.trim(),
      has_security_contact: profile.governance.hasSecurityContact,
      security_contact_type: profile.governance.securityContactType.trim() || "email",
      security_contact_pgp_available: profile.governance.securityContactPgpAvailable,
      operator_publicly_identified: profile.governance.operatorPubliclyIdentified,
      scope_defined: profile.governance.scopeDefined,
      conflict_of_interest_statement: profile.governance.conflictOfInterestStatement
    },

    disclosure_process: {
      disclosure_model: profile.disclosureProcess.disclosureModel,
      supports_embargo_process: profile.disclosureProcess.supportsEmbargoProcess,
      embargo_policy_public: profile.disclosureProcess.embargoPolicyPublic,
      average_embargo_duration_days: Number(profile.disclosureProcess.averageEmbargoDurationDays) || 0,
      human_review_required: profile.disclosureProcess.humanReviewRequired,
      automated_allocation: profile.disclosureProcess.automatedAllocation,
      review_sla_days: Number(profile.disclosureProcess.reviewSlaDays) || 2
    },

    allocation_quality: {
      identifier_reuse_detected: profile.allocationQuality.identifierReuseDetected,
      identifier_reassignment_detected: profile.allocationQuality.identifierReassignmentDetected,
      uses_permalinks: profile.allocationQuality.usesPermalinks,
      reference_http_200_ratio: Number(profile.allocationQuality.referenceHttp200Ratio) || 1.0,
      reference_http_404_ratio: Number(profile.allocationQuality.referenceHttp404Ratio) || 0.0,
      average_description_length: Number(profile.allocationQuality.averageDescriptionLength) || 500,
      has_cwe_classification: profile.allocationQuality.hasCweClassification,
      has_cvss_score: profile.allocationQuality.hasCvssScore,
      has_epss_score: profile.allocationQuality.hasEpssScore,
      has_vendor_acknowledgement: profile.allocationQuality.hasVendorAcknowledgement,
      average_fields_per_record: Number(profile.allocationQuality.averageFieldsPerRecord) || 12
    },

    interoperability: {
      provides_machine_readable_feed: profile.interoperability.providesMachineReadableFeed,
      feed_format: profile.interoperability.feedFormat,
      schema_version_declared: profile.interoperability.schemaVersionDeclared,
      uses_cwe: profile.interoperability.usesCwe,
      uses_cvss: profile.interoperability.usesCvss,
      uses_openvex: profile.interoperability.usesOpenvex,
      uses_ossf_schema: profile.interoperability.usesOssfSchema
    },

    synchronization: {
      provides_sync_endpoint: profile.synchronization.providesSyncEndpoint,
      sync_endpoint_url: profile.synchronization.syncEndpointUrl.trim(),
      sync_protocol_version: profile.synchronization.syncProtocolVersion.trim() || "1.0",
      last_successful_sync: profile.synchronization.lastSuccessfulSync.trim(),
      sync_uptime_ratio_30d: Number(profile.synchronization.syncUptimeRatio30d) || 1.0,
      average_sync_latency_seconds: Number(profile.synchronization.averageSyncLatencySeconds) || 2
    },

    evaluation_metadata: {
      evaluation_version: profile.evaluationMetadata.evaluationVersion || "1.0",
      last_evaluated: profile.evaluationMetadata.lastEvaluated || new Date().toISOString().split("T")[0],
      overall_score: Number(profile.evaluationMetadata.overallScore) || 80
    }
  };
}

/**
 * Conformance JSONを整形されたインデント付き文字列にシリアライズする
 */
export function serializeGnaJson(profile: GnaProfile): string {
  const obj = generateGnaConformanceJson(profile);
  return JSON.stringify(obj, null, 2);
}

/**
 * 入力値の簡易バリデーション（必須項目のチェック）
 */
export function validateGnaProfile(profile: GnaProfile): string[] {
  const errors: string[] = [];
  if (!profile.gnaId || !profile.gnaId.trim()) {
    errors.push("GNA識別子（gna_id）が入力されていません。");
  }
  if (!profile.governance.disclosurePolicyUrl || !profile.governance.disclosurePolicyUrl.trim()) {
    errors.push("開示ポリシーのURL（disclosure_policy_url）が入力されていません。");
  }
  if (profile.synchronization.providesSyncEndpoint && (!profile.synchronization.syncEndpointUrl || !profile.synchronization.syncEndpointUrl.trim())) {
    errors.push("同期エンドポイントが有効ですが、URL（sync_endpoint_url）が入力されていません。");
  }
  return errors;
}

/**
 * 初期状態のデフォルトGnaProfileを生成するヘルパー（サンプル値ベース）
 */
export function createDefaultGnaProfile(): GnaProfile {
  const today = new Date().toISOString().split("T")[0];
  return {
    gcveBcpVersion: "BCP-06-1.0",
    gnaId: "65535",
    lastUpdated: today,

    governance: {
      hasPublicDisclosurePolicy: true,
      disclosurePolicyUrl: "https://research.example/disclosure-policy",
      disclosurePolicyLastUpdated: today,
      hasSecurityContact: true,
      securityContactType: "email",
      securityContactPgpAvailable: true,
      operatorPubliclyIdentified: true,
      scopeDefined: true,
      conflictOfInterestStatement: false
    },

    disclosureProcess: {
      disclosureModel: "immediate_full_disclosure",
      supportsEmbargoProcess: false,
      embargoPolicyPublic: false,
      averageEmbargoDurationDays: 0,
      humanReviewRequired: true,
      automatedAllocation: false,
      reviewSlaDays: 2
    },

    allocationQuality: {
      identifierReuseDetected: false,
      identifierReassignmentDetected: false,
      usesPermalinks: true,
      referenceHttp200Ratio: 0.98,
      referenceHttp404Ratio: 0.01,
      averageDescriptionLength: 850,
      hasCweClassification: true,
      hasCvssScore: true,
      hasEpssScore: false,
      hasVendorAcknowledgement: false,
      averageFieldsPerRecord: 14
    },

    interoperability: {
      providesMachineReadableFeed: true,
      feedFormat: ["json"],
      schemaVersionDeclared: true,
      usesCwe: true,
      usesCvss: true,
      usesOpenvex: false,
      usesOssfSchema: false
    },

    synchronization: {
      providesSyncEndpoint: true,
      syncEndpointUrl: "https://research.example/gcve-sync",
      syncProtocolVersion: "1.0",
      lastSuccessfulSync: new Date().toISOString(),
      syncUptimeRatio30d: 0.997,
      averageSyncLatencySeconds: 2
    },

    evaluationMetadata: {
      evaluationVersion: "1.0",
      lastEvaluated: today,
      overallScore: 82
    }
  };
}
