import type { AdvisoryI18n } from './i18n-ja'

export const I18N_EN: AdvisoryI18n = {
  "ui": {
    "h1": "Vulnerability Advisory Authoring Tool",
    "intro": "All entered data is processed entirely within your browser and is never sent externally. Copy the generated Markdown to publish on your security advisory portal.",
    "clear": "Clear Inputs",
    "stl": "Status",
    "st0": "Normal (Release Fix)",
    "st1": "Urgent (High Risk of Exploitation)",
    "st2": "Active Exploitation Observed",
    "st3": "End of Life (No Fix Planned)",
    "tl": "Title|Include Product Name, Vulnerability Type, and 'Vulnerability'",
    "tph": "e.g., Authentication Bypass Vulnerability in Product X",
    "aidl": "Advisory ID|Optional tracking identifier",
    "cvel": "CVE ID|Comma-separated, optional",
    "publ": "Initial Publication Date",
    "updl": "Last Updated Date|Only if revised",
    "suml": "Summary|Concise overview at the top",
    "sumph": "Affected versions, vulnerability mechanics, and potential impact.",
    "prodl": "Affected Products|Product name and version range (e.g., All versions prior to 1.5.4)",
    "pn": "Product Name",
    "pv": "Version Range (e.g., 1.0 - 2.3.4)",
    "pdel": "Delete",
    "addprod": "Add Product",
    "vcl": "Version Verification Method|Optional instructions for users to check their installed version",
    "cwel": "Vulnerability Type (CWE)|Select from candidates to auto-fill description and threat examples",
    "cweo": "Other CWE (Custom Input)",
    "cweol": "Custom CWE Input|Format: CWE-ID Name (e.g., CWE-1021 Improper Restriction)",
    "cweoph": "e.g., CWE-1021 Improper Restriction of Rendered UI Layers",
    "cweph": "e.g., CWE-79 Cross-site Scripting (XSS)",
    "cwenl": "Free-text Description when CWE is Unknown|Describe the issue as best as possible",
    "cwenph": "e.g., Vulnerability caused by out-of-bounds memory access",
    "descl": "Vulnerability Description|Specify: (1) Feature affected, (2) Root flaw, (3) Required attack conditions. Do not include exploit steps.",
    "impl": "Threat / Impact|Potential consequences for users. Do not include exploit steps.",
    "cvssl": "CVSS v3.1 Base Score",
    "cvsss": "Calculate CVSS score by selecting metrics below",
    "cvssclear": "Reset All Metrics",
    "scorel": "Base Score",
    "scoreph": "(Calculated after all 8 metrics are selected)",
    "sevl": "Severity",
    "sev0": "(Auto-calculated from CVSS score)",
    "vecl": "CVSS Vector",
    "fixl": "Remediation / Solution|Download links and patch installation steps",
    "workl": "Workarounds|Mitigation steps if immediate patching is not feasible",
    "refl": "References|JVN, CVE, or official links (One per line)",
    "credl": "Acknowledgments|Optional reporter credits",
    "histl": "Revision History|Updates after initial release (e.g., 2026-11-02 Added workarounds)",
    "histph": "Initial release entry is generated automatically from the publication date.",
    "contl": "Contact Information|Inquiry channel for this advisory",
    "chks": "Pre-publication Review Checklist (This section is not included in the output)",
    "note": "Severity is automatically determined from the CVSS Base Score (9.0+ = Critical, 7.0+ = High, 4.0+ = Medium, 0.1+ = Low). You may override it if your organization has specific criteria.",
    "copy": "Copy Markdown",
    "dl": "Download .md",
    "copied": "Copied to clipboard",
    "copyfail": "Failed to copy. Please select and copy manually.",
    "saved": "Saved successfully",
    "clearq": "Are you sure you want to clear all input fields?",
    "autoOk": "Auto-filled description and threat templates. Please replace placeholders with your specific details.",
    "autoSkip": "Existing text was preserved and not overwritten.",
    "untitled": "(Untitled Advisory)",
    "mid": "Advisory ID",
    "msev": "Severity",
    "mpub": "Published Date",
    "mupd": "Updated Date",
    "tItem": "Item",
    "tCont": "Content",
    "oOver": "Summary",
    "oAff": "Affected Products and Verification",
    "oAffT": "The following products and versions are affected:",
    "tProd": "Product Name",
    "tVer": "Affected Version Range",
    "oVerHow": "To verify the installed version number:",
    "oDesc": "Vulnerability Description",
    "oImp": "Impact / Threat Analysis",
    "oFix": "Remediation and Patch Instructions",
    "oWork": "Workarounds and Mitigations",
    "oRel": "External References",
    "oCred": "Acknowledgments",
    "oHist": "Revision History",
    "oCont": "Contact Channel",
    "fSev": "{s} (CVSS {n})",
    "fCvss": "- CVSS v3.1 Base Score: {n} ({s})",
    "fVec": "- Vector String: {v}",
    "fCweUnk": "- Vulnerability Type: {t}",
    "pubd": "Published initial vulnerability advisory page.",
    "fLvl": "({l})",
    "fLint": "Pre-publication review items remaining: {n}",
    "lintOk": "All required review items are fulfilled.",
    "copyTsv": "📋 Copy Empty Excel Header (TSV)",
    "copiedTsv": "Copied TSV header row to clipboard. You can paste it directly into Excel.",
    "presetSuccess": "Inserted template text",

    "securityTxtTitle": "security.txt Generator",
    "securityTxtSubtitle": "Safely generate and copy an RFC 9116 compliant security.txt file directly in your browser.",
    "copySecurityTxt": "📋 Copy security.txt",
    "copiedSecurityTxt": "Copied security.txt content to clipboard.",
    "dlSecurityTxt": "💾 Download security.txt",

    "modeGna": "GNA / BCP-06 Support",
    "modeCvdProcess": "CVD Process Tracking",
    "modeSbdAttestation": "SbD Minimum Evidence",
    "modeCraGuide": "CRA Compliance Roadmap"
  },
  "sev": {
    "critical": "Critical",
    "high": "High",
    "medium": "Medium",
    "low": "Low",
    "none": "None"
  },
  "stat": {
    "urgent": "If you are using affected products, please apply patches immediately to prevent potential exploitation.",
    "attack": "[CRITICAL] Active exploitation of this vulnerability has been confirmed. Apply remediations immediately.",
    "eol": "This product has reached End of Life (EOL). No security updates will be provided. Upgrade to a supported product or discontinue usage."
  },
  "eolfix": "Please upgrade to a supported release version. If upgrading is not possible, consider decommissioning the product.",
  "unk": "Unable to determine CWE",
  "lv": {
    "req": "Required",
    "rec": "Recommended",
    "chk": "Verification"
  },
  "lint": [
    "Title contains the word 'Vulnerability' alongside product and vulnerability name",
    "Publication date is specified",
    "Summary overview is provided",
    "Affected products and versions are listed",
    "Vulnerability type (CWE or description) is defined",
    "Threat / Impact analysis is described",
    "CVSS Base Score is calculated",
    "Remediation steps are provided (Auto-filled for EOL products)",
    "Security contact information is provided",
    "Workarounds are detailed (or explicitly marked as none)",
    "External references (CVE ID, JVN, etc.) are included",
    "No temporary placeholders (e.g., XXX, example.com) remain",
    "CVE ID follows standard format (e.g., CVE-2026-0001)"
  ],
  "chk": [
    "Reviewed and approved by internal legal, PR, and management teams",
    "Excludes detailed exploit steps or proof-of-concept payload code",
    "Notified support desks and sales partners prior to public release",
    "Confirmed credits/acknowledgments preference with the reporter",
    "Coordinated public release date with coordination centers (e.g., JPCERT/CC, CERT/CC)",
    "Published on dedicated security advisory portal linked from the main site",
    "Ensured page link matches title and reflects last update date",
    "Requested CVE ID from CNA if required"
  ],
  "ph": "[Placeholder]|XXX|example\\.com",
  "imp": {
    "rce": "An unauthorized remote attacker could execute arbitrary code on the system running this software, potentially leading to data exfiltration, system modification, or full compromise.",
    "auth": "An attacker could bypass authentication controls and gain unauthorized access to privileged functions and sensitive information.",
    "authz": "An authenticated user could perform operations or access resources beyond their authorized permission level.",
    "xss": "An attacker could execute arbitrary JavaScript in the victim's web browser, enabling session hijacking or credential theft.",
    "info": "An attacker could access sensitive information that should normally be restricted.",
    "dos": "An attacker could cause a Denial of Service (DoS), resulting in application crashes or severe performance degradation.",
    "csrf": "An attacker could trick an authenticated user into performing unintended administrative actions.",
    "sqli": "An attacker could execute unauthorized database queries to read, modify, or delete backend data.",
    "file": "An attacker could read or overwrite arbitrary files on the underlying server filesystem.",
    "mem": "An attacker could trigger abnormal application termination or execute arbitrary code via memory corruption.",
    "ssrf": "An attacker could abuse the server to relay unauthorized HTTP requests to internal networks or protected cloud resources.",
    "gen": "Unexpected input processing could cause unintended application behavior, potentially leading to data leakage or service disruption.",
    "priv": "A standard user could escalate privileges to administrative or system-level access."
  },
  "cvss": {
    "AV": ["Attack Vector (AV)", "Context by which vulnerability exploitation is possible.", { "N": ["Network", "Bound to the network stack; exploitable remotely over the internet."], "A": ["Adjacent", "Bound to the network stack; requires physical proximity or local subnet access."], "L": ["Local", "Requires local user account login or tricking user into opening a malicious file."], "P": ["Physical", "Requires physical interaction with the target device."] }],
    "AC": ["Attack Complexity (AC)", "Conditions beyond attacker control that must exist to execute the attack.", { "L": ["Low", "No special conditions exist. The attacker can repeatedly exploit the flaw."], "H": ["High", "Exploitation relies on specific configurations or precise timing conditions."] }],
    "PR": ["Privileges Required (PR)", "Level of privileges an attacker must possess before exploiting the vulnerability.", { "N": ["None", "Unauthenticated; no access privileges required."], "L": ["Low", "Requires basic user privileges."], "H": ["High", "Requires administrative or elevated system privileges."] }],
    "UI": ["User Interaction (UI)", "Requirement for a human user (other than attacker) to participate.", { "N": ["None", "Can be exploited without any user interaction."], "R": ["Required", "Requires user action, such as clicking a link or opening a document."] }],
    "S": ["Scope (S)", "Whether the flaw impacts components beyond its security authority.", { "U": ["Unchanged", "Impact is restricted to the vulnerable software component itself."], "C": ["Changed", "Impact extends to other components or hypervisor/host OS."] }],
    "C": ["Confidentiality (C)", "Impact to the confidentiality of information assets.", { "H": ["High", "Total loss of confidentiality or exposure of critical secrets."], "L": ["Low", "Access to restricted data is limited in scope."], "N": ["None", "No impact to confidentiality."] }],
    "I": ["Integrity (I)", "Impact to the integrity and trustworthiness of system data.", { "H": ["High", "Total loss of system integrity; data can be modified arbitrarily."], "L": ["Low", "Modification of data is possible but limited in scope."], "N": ["None", "No impact to data integrity."] }],
    "A": ["Availability (A)", "Impact to the availability of the target service or system.", { "H": ["High", "Total denial of service or persistent system unavailability."], "L": ["Low", "Performance degradation or short-lived service disruption."], "N": ["None", "No impact to system availability."] }]
  },
  "presets": {
    "summary": [["Standard Overview", "A vulnerability in Product X version Y and earlier has been identified. Successful exploitation could allow a remote attacker to achieve unauthorized access. Users are advised to apply security updates immediately."]],
    "versioncheck": [["Menu Verification", "1. Launch Product X and select 'Help' -> 'About'.\n2. Verify the installed version number displayed in the dialog."], ["CLI Command", "Run the following command in terminal to check version:\nproduct-x --version"]],
    "desc": [["Input Validation Flaw", "A flaw in the file upload feature of Product X allows arbitrary files to be written outside the intended directory due to improper filename validation."], ["Auth Bypass Flaw", "An authentication handling flaw in the administrative interface allows unauthenticated access to specific management endpoints."], ["Configuration Specific", "An input handling flaw exists in Feature Y. This issue only affects deployments where Feature Y is explicitly enabled.\n\n* Note: Default installations with Feature Y disabled are not affected."]],
    "impact": [["Remote Code Execution", "rce"], ["Authentication Bypass", "auth"], ["Cross-site Scripting (XSS)", "xss"], ["Information Disclosure", "info"], ["Denial of Service (DoS)", "dos"], ["Privilege Escalation", "priv"]],
    "fix": [["Upgrade to Release", "Upgrade Product X to version Y or later.\nDownload: https://example.com/download\nUpgrade Guide: [suspicious link removed]"], ["Apply Security Patch", "Download and apply the security patch:\n- Patch: Product X Security Update (Windows/Linux) Release Date: 2026-11-02"]],
    "work": [["Network Access Control", "Restrict network access to management port of Product X using firewalls or IP access control lists."], ["Disable Feature", "Disable Feature Y in configuration. Steps: [suspicious link removed]"], ["No Workaround Available", "No effective workaround is currently available. Applying the official patch is strongly recommended."]],
    "credit": [["Reporter Credits", "We thank Security Researcher X for responsibly disclosing this vulnerability to us."]],
    "contact": [["PSIRT Contact", "Product Security Incident Response Team (PSIRT)\nEmail: security@example.com\nPGP Key: https://example.com/pgp-key.txt"]]
  },
  "cwes": [
    "CWE-20 Improper Input Validation",
    "CWE-22 Path Traversal",
    "CWE-78 OS Command Injection",
    "CWE-79 Cross-site Scripting (XSS)",
    "CWE-89 SQL Injection",
    "CWE-94 Code Injection",
    "CWE-119 Buffer Errors / Out-of-bounds Read/Write",
    "CWE-200 Information Exposure",
    "CWE-287 Improper Authentication",
    "CWE-306 Missing Authentication for Critical Function",
    "CWE-352 Cross-Site Request Forgery (CSRF)",
    "CWE-400 Uncontrolled Resource Consumption (DoS)",
    "CWE-434 Unrestricted Upload of File with Dangerous Type",
    "CWE-502 Deserialization of Untrusted Data",
    "CWE-611 Improper Restriction of XML External Entity Reference (XXE)",
    "CWE-798 Use of Hard-coded Credentials",
    "CWE-862 Missing Authorization",
    "CWE-918 Server-Side Request Forgery (SSRF)"
  ],
  "cweText": {
    "CWE-20": ["A vulnerability exists in Feature Y due to improper input validation, allowing unexpected inputs to alter application logic.", "gen"],
    "CWE-22": ["A path traversal vulnerability exists in Feature Y due to insufficient path sanitization, allowing access to restricted files outside the root folder.", "file"],
    "CWE-78": ["An OS command injection flaw exists in Feature Y, allowing attackers to execute arbitrary system commands via crafted input.", "rce"],
    "CWE-79": ["A cross-site scripting (XSS) vulnerability in Feature Y allows remote attackers to inject arbitrary web scripts into victim browsers.", "xss"],
    "CWE-89": ["An SQL injection vulnerability in Feature Y allows unauthorized database manipulation via improperly escaped input.", "sqli"],
    "CWE-94": ["A code injection flaw in Feature Y allows untrusted input to be evaluated as application code.", "rce"],
    "CWE-119": ["A buffer handling flaw in Feature Y allows out-of-bounds memory operations, potentially leading to system crashes or arbitrary code execution.", "mem"],
    "CWE-200": ["An information exposure flaw in Feature Y allows unauthorized users to retrieve sensitive system details.", "info"],
    "CWE-287": ["An authentication flaw in Feature Y allows attackers to bypass login checks and gain unauthorized access.", "auth"],
    "CWE-306": ["Feature Y lacks authentication checks, allowing unauthenticated users to invoke administrative actions.", "auth"],
    "CWE-352": ["A CSRF vulnerability in Feature Y allows malicious sites to perform unauthorized actions on behalf of logged-in users.", "csrf"],
    "CWE-400": ["Uncontrolled resource consumption in Feature Y allows attackers to exhaust system memory or CPU, causing a Denial of Service.", "dos"],
    "CWE-434": ["Unrestricted file upload in Feature Y allows remote code execution via uploaded web shells.", "rce"],
    "CWE-502": ["Deserialization of untrusted data in Feature Y allows remote code execution via serialized payload execution.", "rce"],
    "CWE-611": ["An XML external entity (XXE) flaw in Feature Y allows remote attackers to disclose local file contents via crafted XML documents.", "info"],
    "CWE-798": ["Hard-coded cryptographic keys or passwords allow unauthorized access to the application.", "auth"],
    "CWE-862": ["Feature Y lacks authorization checks, allowing low-privileged users to access restricted administrative functions.", "authz"],
    "CWE-918": ["An SSRF vulnerability in Feature Y allows the server to send unauthorized HTTP requests to internal network services.", "ssrf"]
  },
  "vex": {
    "title": "Product Portfolio VEX Generator",
    "intro": "Export vulnerability investigation status across your product portfolio in CSAF 2.0 VEX format.",
    "cveLabel": "Target CVE ID (Required)",
    "cvePh": "e.g., CVE-2026-1234",
    "pubNameLabel": "Publisher Name (Organization / PSIRT)",
    "pubNamePh": "e.g., Sample Corp PSIRT",
    "pubNsLabel": "Publisher Namespace (URL)",
    "pubNsPh": "https://example.com",
    "docIdLabel": "Document Tracking ID",
    "docIdPh": "VEX-2026-001",
    "pubDateLabel": "Publication Date",
    "summaryLabel": "Investigation Summary",
    "summaryPh": "Vulnerability impact analysis results across our product portfolio.",
    "prodSectionTitle": "Product Status Configuration",
    "modeForm": "📝 Form Input (Single Item)",
    "modePaste": "📋 Excel Copy-Paste (TSV Bulk)",
    "btnCopyTsv": "📋 Copy Current Table for Excel",
    "btnCopyHeader": "📋 Copy Empty Excel Header (TSV)",
    "btnAddProd": "+ Add Product",
    "btnDelProd": "Delete Product",
    "btnImportAppend": "+ Append to Table",
    "btnImportReplace": "🔄 Overwrite Existing Table",
    "btnExportPaste": "📤 Export Table Content Here",
    "pasteGuideTitle": "💡 Excel Copy-Paste Format & Required Statements",
    "pasteGuideIntro": "When pasting cells copied from Excel, arrange columns in the following 5-tab-separated order:",
    "pastePh": "Product\tVersion\tStatus\tJustification\tNotes\nGateway Appliance\tv2.4 and earlier\tNot Affected\tCode Not Present\tFeature disabled by default\nSensor Node\tv1.0.0\tAffected\t\tFix scheduled in next FW release",
    "refsLabel": "Reference Links (URLs)",
    "status": {
      "known_not_affected": "Not Affected",
      "known_affected": "Affected",
      "fixed": "Fixed",
      "under_investigation": "Under Investigation"
    },
    "justification": {
      "vulnerable_code_not_present": "Code Not Present",
      "vulnerable_code_not_in_execute_path": "Code Not in Execute Path",
      "vulnerable_code_cannot_be_controlled_by_adversary": "Cannot Be Controlled by Adversary",
      "inline_mitigations_already_exist": "Inline Mitigations Already Exist"
    },
    "actionCategory": {
      "workaround": "Workaround",
      "mitigation": "Mitigation",
      "none_available": "None Available",
      "vendor_fix": "Vendor Fix",
      "impact": "Impact Analysis"
    }
  },
  "securityTxtFields": {
    "contact": "Contact Channel|Security contact email or reporting URL (e.g., mailto:security@example.com)",
    "expires": "Expiration Date (Expires)|Policy expiration timestamp in ISO 8601 format (e.g., 2027-12-31T23:59:00.000Z)",
    "encryption": "Encryption Key (Encryption)|URL to PGP public key for encrypted security reports",
    "acknowledgments": "Acknowledgments|URL to security hall of fame or credit page",
    "preferredLanguages": "Preferred Languages|Comma-separated language codes (e.g., en, ja, de)",
    "canonical": "Canonical URL|Official published URL of this security.txt file",
    "policy": "Security Policy|URL to vulnerability disclosure policy or bug bounty program",
    "hiring": "Security Hiring|URL to security career opportunities"
  },
  "cvdFields": {
    "orgName": "Organization Name|Name of organization issuing this policy",
    "contactEmail": "Security Contact Email|Email address for receiving security reports (e.g., security@example.com)",
    "scope": "Scope|Products, services, and domains covered under this policy",
    "reporting": "Reporting Guidelines|Required report details, PoC requirements, and PGP key details",
    "safeHarbor": "Safe Harbor Statement|Explicit legal protection for good-faith security researchers",
    "timeline": "Response Timeline|Target timeframe for initial acknowledgment (e.g., within 24-48 hours)",
    "preferences": "Disclosure Rules & Embargo|Coordinated disclosure timeline and embargo rules prior to patch release",
    "acknowledgments": "Acknowledgments Policy|Conditions for publishing researcher credits in hall of fame"
  },
  "cvdUi": {
    "cvdTitle": "CVD Policy Generator",
    "cvdSubtitle": "Generate a Coordinated Vulnerability Disclosure (CVD) policy aligned with ENISA guidelines and CRA requirements.",
    "copyCvd": "📋 Copy CVD Policy",
    "copiedCvd": "Copied CVD policy content to clipboard.",
    "dlCvd": "💾 Download CVD Policy (.md)",
    "presetTitle": "💡 Quick Setup Presets (Select an organizational profile to auto-fill templates)"
  },
  "cvdPresets": [
    {
      "id": "standard",
      "label": "🏢 Standard (SMEs & General Vendors)",
      "desc": "Practical default configuration for standard commercial product and service vendors.",
      "values": {
        "scope": "All web applications, mobile services, and published software products directly owned by our company. * Third-party hosted infrastructures are excluded.",
        "reporting": "Please send report details to our security contact email. Include reproduction steps, affected version numbers, and Proof of Concept (PoC). Encrypt sensitive details using our PGP key.",
        "safeHarbor": "We will not pursue civil or criminal legal action against security researchers who conduct good-faith security research complying with this policy.",
        "timeline": "- Initial Acknowledgment: Within 2 business days\n- Triage & Severity Assessment: Within 10 business days\n- Target Fix Release: Within 90 days (depending on vulnerability severity)",
        "preferences": "We request a mutual embargo period prior to patch release. Detailed vulnerability information should remain confidential until an official fix is available.",
        "acknowledgments": "Upon patch deployment, researchers will be credited on our official Hall of Fame page with their consent."
      }
    },
    {
      "id": "enterprise",
      "label": "🏛️ Enterprise / Dedicated PSIRT",
      "desc": "Strict settings for enterprise environments with dedicated PSIRT teams and legal processes.",
      "values": {
        "scope": "All products, firmware, cloud platforms, and network domains managed across our corporate group.",
        "reporting": "Submit reports via designated PSIRT portal or PGP-encrypted email. Include impact analysis, PoC, and relevant logs.",
        "safeHarbor": "We guarantee safe harbor for research performed within defined scope boundaries in good faith.",
        "timeline": "- Acknowledgment: Within 24-48 hours\n- Initial Triage Notification: Within 5 business days\n- Regular Status Updates: Every 14 days",
        "preferences": "Standard 90-day embargo applies from initial report date. Public disclosure will be coordinated jointly.",
        "acknowledgments": "Contributors will be acknowledged in official security advisories and corporate credit listings."
      }
    },
    {
      "id": "oss",
      "label": "🌿 Open Source / Individual Developer",
      "desc": "Streamlined rules for open source projects and small maintainer teams.",
      "values": {
        "scope": "Source code repositories and official release binaries under this project.",
        "reporting": "Do not report vulnerabilities via public issue trackers. Contact maintainers directly via private email.",
        "safeHarbor": "Good-faith research aimed at improving project security will not be subject to legal prosecution.",
        "timeline": "- Acknowledgment: Within 5 business days (Best effort)\n- Fix Development: Prioritized based on maintainer capacity and severity",
        "preferences": "Please allow maintainers to develop a fix before publicly discussing or publishing vulnerability details.",
        "acknowledgments": "Contributors will be recognized in release notes and project CONTRIBUTORS files."
      }
    }
  ],
  "gnaFields": {
    "gnaId": "GNA Identifier (GNA ID)|Assigned unique GNA ID (e.g., GNA-001)",
    "organization": "Organization Name|Name of vendor or entity operating as GNA",
    "disclosureModel": "Disclosure Model|Coordinated Vulnerability Disclosure (CVD) or Full Disclosure choice",
    "securityContact": "Security Contact|Receiving contact address for GNA operations"
  },
  "gnaUi": {
    "gnaTitle": "GNA (GCVE Numbering Authority) Support Tool",
    "gnaSubtitle": "Generate BCP-06 compliant Conformance JSON and metadata entirely in browser.",
    "copyGnaJson": "📋 Copy Conformance JSON",
    "copiedGnaJson": "Copied Conformance JSON to clipboard.",
    "dlGnaJson": "💾 Download Conformance JSON",
    "gnaConstraintNotice": "🔒 Client-Side Mode: No data or ID assignment history is stored on any server. Maintain deduplication tracking in your local Git or registry logs."
  },
  "craGuideUi": {
    "title": "CRA (EU Cyber Resilience Act) Compliance Roadmap",
    "subtitle": "Complete 4 steps to fulfill vulnerability management requirements under CRA Annex I for products with digital elements.",
    "step1Title": "Publish Contact Channel",
    "step1Desc": "Publish RFC 9116 security.txt so security researchers can report vulnerabilities safely.",
    "step2Title": "Establish CVD Policy",
    "step2Desc": "Define vulnerability response rules, timelines, and safe harbor legal protections.",
    "step3Title": "Maintain SBOM",
    "step3Desc": "Document open-source and third-party software components in CycloneDX 1.6 format.",
    "step4Title": "Manage & Disclose",
    "step4Desc": "Track internal remediation progress, issue VEX status, and publish security advisories."
  },
  "cvdProcessFields": {
    "cveId": "Tracking ID / CVE ID|Incident tracking identifier (e.g., CVE-2026-9999 / CVD-2026-001)",
    "title": "Vulnerability Title|Product and vulnerability summary (e.g., Auth Bypass in Product X)",
    "reporter": "Reporter / Source|Name of reporter or coordination center (e.g., CERT/CC, Researcher name)",
    "assignee": "Internal Assignee / PSIRT|Assigned engineering team or response lead",
    "receivedDate": "Report Received Date|Date when report was initially received",
    "targetReleaseDate": "Target Release Date (Embargo)|Agreed target date for patch and advisory release",
    "generalNotes": "General Notes & Instructions|Internal verification URLs, test notes, and coordination status"
  },
  "cvdProcessUi": {
    "title": "CVD Process Tracking & Timeline",
    "subtitle": "Manage the entire vulnerability lifecycle from intake to verification, remediation, and disclosure using interactive checklists and timelines.",
    "copyMd": "📋 Copy Markdown Progress Report",
    "copiedMd": "Copied Markdown progress report to clipboard.",
    "dlMd": "💾 Download Markdown Progress Report (.md)",
    "copyJson": "📋 Copy JSON Data",
    "copiedJson": "Copied JSON data to clipboard.",
    "dlJson": "💾 Download JSON Backup (.json)",
    "noticeBadge": "🔒 Client-Side Only: No data is sent or saved on servers. Download Markdown or JSON backups to preserve your tracking records.",
    "progressLabel": "Overall Progress",
    "completedCount": "Completed Steps",
    "phaseTitle": "Phase Checklist",
    "timelineTitle": "📅 Milestone Timeline",
    "btnReset": "🔄 Reset to Default",
    "resetConfirm": "Are you sure you want to reset the checklist to initial default state?",
    "filterAll": "Show All",
    "filterPending": "Pending Only",
    "filterDone": "Completed Only"
  },
  "cvdProcessPhases": [
    {
      "id": "phase1",
      "title": "1. Reception & Initial Response",
      "description": "Report intake, acknowledgment reply, tracking ID assignment, and initial internal logging",
      "items": [
        {
          "id": "intake_receipt",
          "title": "Send Acknowledgment Response",
          "description": "Send initial acknowledgment email to the reporter (Target: Within 24-48 hours)"
        },
        {
          "id": "intake_log",
          "title": "Assign Tracking ID & Log Incident",
          "description": "Issue internal ID (CVD-YYYY-NNN) and set up internal communication channel"
        },
        {
          "id": "intake_scope",
          "title": "Initial Scope Verification",
          "description": "Confirm whether affected product, version, or service is maintained by your organization"
        }
      ]
    },
    {
      "id": "phase2",
      "title": "2. Triage & Remediation",
      "description": "Vulnerability reproduction, CVSS scoring, patch development, workaround formulation, and regression testing",
      "items": [
        {
          "id": "triage_reproduce",
          "title": "Vulnerability Reproduction & CVSS Scoring",
          "description": "Verify flaw in test environment and calculate preliminary CVSS Base Score"
        },
        {
          "id": "triage_severity",
          "title": "Confirm Severity & Assign Engineering Team",
          "description": "Determine severity rating (Critical/High/Medium) and assign lead engineering team"
        },
        {
          "id": "patch_develop",
          "title": "Develop Patch / Workaround",
          "description": "Develop software fix or formulate effective temporary workaround"
        },
        {
          "id": "patch_test",
          "title": "Regression & Verification Testing",
          "description": "Verify patch resolves vulnerability without introducing functional side effects"
        }
      ]
    },
    {
      "id": "phase3",
      "title": "3. Coordination & Disclosure Prep",
      "description": "Target disclosure date agreement, CVE ID allocation, and security advisory draft preparation",
      "items": [
        {
          "id": "coord_embargo",
          "title": "Coordinate Embargo / Public Target Date",
          "description": "Agree on target public release date with reporter and coordination centers"
        },
        {
          "id": "coord_cve",
          "title": "Confirm / Reserve CVE ID",
          "description": "Obtain CVE ID from CNA or verify existing CVE mapping"
        },
        {
          "id": "coord_advisory",
          "title": "Draft Advisory & VEX Statements",
          "description": "Generate Markdown advisory and CSAF VEX statements using Secriptorium"
        }
      ]
    },
    {
      "id": "phase4",
      "title": "4. Release & Publication",
      "description": "Patch deployment, advisory publication, reporter notification, credits, and follow-up",
      "items": [
        {
          "id": "release_patch",
          "title": "Official Release of Security Patch",
          "description": "Publish updated software packages to official distribution channels"
        },
        {
          "id": "release_advisory",
          "title": "Publish Security Advisory",
          "description": "Publish advisory to public portal and reference links in security.txt"
        },
        {
          "id": "release_notify",
          "title": "Notify Reporter & Publish Credits",
          "description": "Send resolution notice to reporter and list credits on Hall of Fame upon agreement"
        }
      ]
    }
  ],
  "sbdAttestationUi": {
    "title": "Secure by Design Minimum Evidence Attestation Generator",
    "subtitle": "Generate human-readable and machine-processable (CycloneDX 1.6 CDXA) attestation declarations for CRA compliance based on ENISA Playbook 4.13 & 4.14.",
    "noticeBadge": "🔒 Client-Side Only: Attestation data is processed locally and never transmitted to any server. Download Markdown or CycloneDX 1.6 CDXA JSON to preserve your records.",
    "productName": "Target Product Name|Name of product or module being attested (e.g., SafeGate-X1)",
    "productVersion": "Product Version|e.g., v2.1.0 / Firmware 1.0.4",
    "asserterName": "Asserter / Organization Name|Name of entity making declaration (e.g., Sample Corp PSIRT)",
    "asserterRole": "Asserter Role|e.g., Product Security Lead / Development Director",
    "assessmentDate": "Assessment Date",
    "checklistTitle": "✅ Minimum Evidence Checklist",
    "generalNotes": "General Notes & Comments|Test result URLs, internal wiki links, or exception notes",
    "btnReset": "🔄 Reset Checklist",
    "resetConfirm": "Are you sure you want to reset all checks and evidence notes?"
  },
  "sbdAttestationItems": [
    {
      "id": "ev_vuln_board",
      "playbookId": "4.13",
      "playbookTitle": "4.13 Vulnerability & Patch Management",
      "title": "Maintain Vulnerability Tracking Board / Register",
      "description": "Track reported vulnerability severity, assignee, target completion dates, and status.",
      "explanation": "Demonstrates to auditors that reported vulnerabilities have assigned accountability and target completion timelines.",
      "examples": [
        "GitHub Issues / GitHub Projects vulnerability tracking board",
        "Jira / Redmine security ticket list",
        "Internal vulnerability tracking spreadsheet"
      ],
      "presets": [
        { "label": "GitHub Issue Board", "value": "docs/evidence/github-issue-board.md" },
        { "label": "Jira Ticket List", "value": "docs/evidence/jira-vulnerability-tickets.pdf" },
        { "label": "Internal Tracking Log", "value": "docs/evidence/vulnerability-management-log.xlsx" }
      ],
      "craRef": "CRA Annex I Part II (2), (5)"
    },
    {
      "id": "ev_sla_defined",
      "playbookId": "4.13",
      "playbookTitle": "4.13 Vulnerability & Patch Management",
      "title": "Define Patch Remediation SLA",
      "description": "Define triage timeframes and fix release target SLAs based on vulnerability severity.",
      "explanation": "Proves that defined commitments exist so vulnerabilities are handled within agreed SLA timeframes upon reception.",
      "examples": [
        "Target SLAs defined in CVD policy or PSIRT operating procedure (e.g., Critical: 24h intake, High: 14d fix)",
        "SLA policy specification document"
      ],
      "presets": [
        { "label": "Standard SLA Setup", "value": "docs/evidence/psirt-sla-definition.md" },
        { "label": "CVD Policy Alignment", "value": "docs/evidence/cvd-policy-timeline.md" }
      ],
      "craRef": "CRA Annex I Part II (2)"
    },
    {
      "id": "ev_scan_ci",
      "playbookId": "4.13",
      "playbookTitle": "4.13 Vulnerability & Patch Management",
      "title": "Automated CI/CD Scans (SAST & Dependencies)",
      "description": "Execute static code analysis and dependency vulnerability scanning automatically during build and release.",
      "explanation": "Demonstrates that automated tools check for known flaws and vulnerable dependencies on code commits and releases.",
      "examples": [
        "GitHub Actions (Trivy / Snyk / CodeQL / Dependency Review) workflow execution logs",
        "GitLab CI / SonarQube scan reports"
      ],
      "presets": [
        { "label": "GitHub Actions (Trivy)", "value": ".github/workflows/trivy-scan.yml" },
        { "label": "Snyk CI Scan", "value": "docs/evidence/snyk-container-scan.json" },
        { "label": "SonarQube Log", "value": "docs/evidence/sonarqube-sast-report.pdf" }
      ],
      "craRef": "CRA Annex I Part I (1.2.a), Part II (1)"
    },
    {
      "id": "ev_sbom_generation",
      "playbookId": "4.14",
      "playbookTitle": "4.14 Supply Chain Security Controls",
      "title": "Machine-Processable SBOM (CycloneDX) Storage",
      "description": "Generate and store machine-readable Software Bill of Materials (SBOM) for each release artifact.",
      "explanation": "Ensures open-source and third-party software components in shipped products can be identified and queried.",
      "examples": [
        "CycloneDX 1.6 JSON file generated during release build",
        "bom.json attached to GitHub Release assets"
      ],
      "presets": [
        { "label": "CycloneDX JSON Storage", "value": "build/reports/cyclonedx-bom.json" },
        { "label": "Syft Auto Generation", "value": "docs/evidence/syft-sbom-build.log" }
      ],
      "craRef": "CRA Annex I Part II (1)"
    },
    {
      "id": "ev_peer_review",
      "playbookId": "4.14",
      "playbookTitle": "4.14 Supply Chain Security Controls",
      "title": "Code Review & Peer Approvals (CODEOWNERS)",
      "description": "Mandate peer code reviews and approvals for security-sensitive code modifications.",
      "explanation": "Verifies that single developers cannot unilaterally commit unauthorized code or insecure configurations to production.",
      "examples": [
        "CODEOWNERS file in repository",
        "GitHub / GitLab Pull Request review and approval history"
      ],
      "presets": [
        { "label": "CODEOWNERS Policy", "value": ".github/CODEOWNERS" },
        { "label": "PR Approval Logs", "value": "docs/evidence/pr-approval-history.md" }
      ],
      "craRef": "CRA Annex I Part I (1.2.f)"
    },
    {
      "id": "ev_artifact_signing",
      "playbookId": "4.14",
      "playbookTitle": "4.14 Supply Chain Security Controls",
      "title": "Cryptographic Signing of Artifacts & Patches",
      "description": "Cryptographically sign distributed firmware binaries and patches so integrity can be verified.",
      "explanation": "Provides verification proof that updates have not been tampered with in transit before application.",
      "examples": [
        "Container / binary signatures using Sigstore Cosign",
        "PGP / GPG signature files (.asc)",
        "Firmware signature verification logs"
      ],
      "presets": [
        { "label": "Cosign Signature", "value": "docs/evidence/cosign-signature.bundle" },
        { "label": "GPG / PGP Signature", "value": "build/releases/firmware.bin.asc" }
      ],
      "craRef": "CRA Annex I Part II (7)"
    },
    {
      "id": "ev_readonly_fs",
      "playbookId": "sbd_general",
      "playbookTitle": "Secure by Default Baseline",
      "title": "Read-Only Root Filesystem (Read-only FS)",
      "description": "Enforce immutable filesystem architecture to prevent malware persistence and tampering.",
      "explanation": "Hardening control preventing attackers from modifying system binaries or establishing persistence if compromised.",
      "examples": [
        "Linux partition table mounted with read-only (ro) flag for /",
        "Docker / Container launch option read_only: true"
      ],
      "presets": [
        { "label": "Read-Only Mount", "value": "config/system/fstab" },
        { "label": "Docker read_only", "value": "deploy/docker-compose.yml" }
      ],
      "craRef": "CRA Annex I Part I (1.2.f), (1.2.j)"
    },
    {
      "id": "ev_no_default_credentials",
      "playbookId": "sbd_general",
      "playbookTitle": "Secure by Default Baseline",
      "title": "Elimination of Hard-Coded Default Credentials",
      "description": "Enforce unique initial passwords or mandatory password change upon first boot.",
      "explanation": "Ensures no factory default passwords (e.g., admin/admin) exist, enforcing unique per-device keys or initial setup wizard.",
      "examples": [
        "Initial setup wizard password validation code",
        "Unique per-device initial password stickers tied to hardware serial numbers"
      ],
      "presets": [
        { "label": "Mandatory Initial Setup", "value": "src/auth/initial-setup-wizard.ts" },
        { "label": "Per-Device Unique Key", "value": "docs/evidence/device-provisioning-spec.md" }
      ],
      "craRef": "CRA Annex I Part I (1.2.b), (1.2.d)"
    }
  ]
}
