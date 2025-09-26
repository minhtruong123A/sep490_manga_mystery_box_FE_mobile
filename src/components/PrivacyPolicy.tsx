import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

export default function PrivacyPolicy() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Privacy Policy */}
            <Text style={[styles.heading, { marginTop: 32 }]}>Privacy Policy</Text>
            <Text style={styles.lastUpdated}>Last Updated: 30th July, 2025</Text>

            <Text style={styles.paragraph}>
                At Manga Mystery Box (MMB), we are committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and safeguard your information when you use our platform. By accessing MMB, you consent to the practices described below.
            </Text>

            <Text style={styles.subHeading}>1. Data We Collect</Text>
            <Text style={styles.paragraph}>Personal Information</Text>
            <Text style={styles.listItem}>📌 Identity Data: Name, email address, phone number (optional).</Text>
            <Text style={styles.listItem}>📌 Transaction Data: Purchase history, payment methods.</Text>
            <Text style={styles.listItem}>📌 Behavioral Data: Cards collected, trades completed, auction activity.</Text>
            <Text style={styles.paragraph}>Note: We do not knowingly collect data from users under 16s.</Text>

            <Text style={styles.subHeading}>2. How We Use Your Data</Text>
            <Text style={styles.paragraph}>
                Your information helps us:
            </Text>
            <Text style={styles.listItem}>🔹 Deliver Services: Process trades/auctions. Authenticate logins.</Text>
            <Text style={styles.listItem}>🔹 Improve MMB: Analyze trends (e.g., popular card series). Test new features.</Text>
            <Text style={styles.listItem}>🔹 Ensure Security: Detect fraud (e.g., fake auctions). Prevent unauthorized access.</Text>

            <Text style={styles.subHeading}>3. Data Sharing & Third Parties</Text>
            <Text style={styles.paragraph}>
                We do not sell your data. Limited sharing occurs only with:
            </Text>
            <Text style={styles.listItem}>🤝 Essential Service Providers: Payment processors (PayOS). Cloud hosting (Cloud).</Text>
            <Text style={styles.listItem}>⚖️ Legal Compliance: If required by law (e.g., court orders). Contracts: Partners must adhere to GDPR/CCPA standards.</Text>

            <Text style={styles.subHeading}>4. Your Rights</Text>
            <Text style={styles.paragraph}>
                You may:
            </Text>
            <Text style={styles.listItem}>✅ Access – Request a copy of your data.</Text>
            <Text style={styles.listItem}>✏️ Correct – Update inaccurate details.</Text>
            <Text style={styles.listItem}>🗑️ Delete – Erase your account/data (exclusions apply).</Text>
            <Text style={styles.listItem}>🚫 Opt-Out – Unsubscribe from marketing.</Text>
            <Text style={styles.paragraph}>
                To exercise rights, contact: MMB@gmail.com. Response time: 15 business days.
            </Text>

            <Text style={styles.subHeading}>5. Authentication & Session Management</Text>
            <Text style={styles.paragraph}>Token-Based System (No Cookies)</Text>
            <Text style={styles.listItem}>🔐 JWT Tokens stored in your browser's memory, containing encrypted user ID and expiration timestamp.</Text>
            <Text style={styles.listItem}>Token auto-refreshes periodically; logout immediately invalidates token.</Text>
            <Text style={styles.listItem}>No local storage, no tracking, and tokens are domain-locked.</Text>

            <Text style={styles.subHeading}>6. Data Retention</Text>
            <Text style={styles.paragraph}>
                We retain your data:
            </Text>
            <Text style={styles.listItem}>Active Accounts: Until deletion request.</Text>
            <Text style={styles.listItem}>Inactive Accounts: 3 years post-last login.</Text>
            <Text style={styles.listItem}>Transaction Records: 7 years (for legal compliance).</Text>
            <Text style={styles.paragraph}>Anonymized data may be kept for analytics.</Text>

            <Text style={styles.subHeading}>7. Policy Updates</Text>
            <Text style={styles.paragraph}>
                We will notify users of material changes via email/platform alerts. Continued use constitutes acceptance.
            </Text>

            <Text style={styles.subHeading}>8. Contact & Complaints</Text>
            <Text style={styles.paragraph}>
                Questions? Contact our Data Protection Officer:
            </Text>
            <Text style={styles.listItem}>📧 Email: MMB@gmail.com</Text>
            <Text style={styles.listItem}>📌 Address: 7 D. D1, Long Thanh My, Thu Duc, Ho Chi Minh</Text>
            <Text style={styles.paragraph}>For EU/UK users: Lodge complaints with your local supervisory authority.</Text>

            <Text style={styles.paragraph}>
                <Text style={{ fontWeight: 'bold' }}>Acknowledgement:</Text> By using MMB, you confirm you have read and understood this policy.
            </Text>

            <Text style={styles.footer}>“Collect with confidence.”</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    lastUpdated: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    subHeading: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 6,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
        color: '#333',
    },
    listItem: {
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 12,
        marginBottom: 6,
        color: '#444',
    },
    footer: {
        fontStyle: 'italic',
        fontSize: 14,
        marginTop: 32,
        textAlign: 'center',
        color: '#666',
    },
});
