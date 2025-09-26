// src/screens/HelpScreen.tsx

import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

export default function TermsOfService() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Terms of Service */}
            <Text style={styles.heading}>Terms Of Service</Text>
            <Text style={styles.lastUpdated}>Last Updated: 30th July, 2025</Text>
            <Text style={styles.paragraph}>
                Welcome to Manga Mystery Box (MMB). By accessing or using our platform, you agree to comply with these Terms of Use ("Terms"). Please read them carefully.
            </Text>

            <Text style={styles.subHeading}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
                By registering for, accessing, or using the MMB platform (including web and mobile applications), you:
            </Text>
            <Text style={styles.listItem}>• Confirm that you are at least 16 years of age (or the legal age in your jurisdiction).</Text>
            <Text style={styles.listItem}>• Acknowledge that these Terms form a legally binding agreement between you and MMB.</Text>
            <Text style={styles.listItem}>• Agree that if you do not accept these Terms, you must immediately cease using the platform.</Text>

            <Text style={styles.subHeading}>2. Eligibility Requirements</Text>
            <Text style={styles.paragraph}>
                To use MMB, you must:
            </Text>
            <Text style={styles.listItem}>✅ Be 16 years or older.</Text>
            <Text style={styles.listItem}>✅ Provide accurate registration information (e.g., email, username).</Text>
            <Text style={styles.listItem}>✅ Not be barred from receiving digital services under applicable laws.</Text>
            <Text style={styles.paragraph}>
                Note: Accounts found to violate eligibility criteria will be terminated without refund.
            </Text>

            <Text style={styles.subHeading}>3. Account Security & Responsibilities</Text>
            <Text style={styles.paragraph}>
                As a user, you agree to:
            </Text>
            <Text style={styles.listItem}>🔒 Maintain confidentiality of your login credentials.</Text>
            <Text style={styles.listItem}>⚠️ Notify MMB immediately of unauthorized account access.</Text>
            <Text style={styles.listItem}>🚫 Never share, sell, or transfer your account to another party.</Text>
            <Text style={styles.paragraph}>
                MMB is not liable for losses resulting from breached accounts due to user negligence.
            </Text>

            <Text style={styles.subHeading}>4. Permitted & Prohibited Uses</Text>
            <Text style={styles.paragraph}>✅ Allowed Activities</Text>
            <Text style={styles.listItem}>Collecting, trading, buying, or auctioning virtual manga characters cards.</Text>
            <Text style={styles.listItem}>Participating in community events and rewards programs.</Text>
            <Text style={styles.paragraph}>🚫 Prohibited Conduct</Text>
            <Text style={styles.listItem}>Fraudulent transactions (e.g., chargebacks, fake listings).</Text>
            <Text style={styles.listItem}>Harassment, hate speech, or spamming other users.</Text>
            <Text style={styles.listItem}>Exploiting bugs or using third-party tools to manipulate the platform.</Text>
            <Text style={styles.listItem}>Commercial use (e.g., reselling MMB assets outside the platform).</Text>
            <Text style={styles.paragraph}>Violations may result in account suspension or legal action.</Text>

            <Text style={styles.subHeading}>5. Intellectual Property Rights</Text>
            <Text style={styles.paragraph}><Text style={{ fontWeight: 'bold' }}>Ownership:</Text> All artwork, characters, logos, and software are owned by MMB or its licensors. Users receive a limited, non-exclusive license to use purchased items within the MMB platform only.</Text>
            <Text style={styles.paragraph}><Text style={{ fontWeight: 'bold' }}>Restrictions:</Text></Text>
            <Text style={styles.listItem}>📌 Copy, modify, or redistribute MMB content without written permission.</Text>
            <Text style={styles.listItem}>📌 Use MMB assets in external projects (e.g., games, merchandise).</Text>
            <Text style={styles.listItem}>📌 Reverse-engineer or decompile the platform’s code.</Text>
            <Text style={styles.paragraph}>Exception: Fan art or non-commercial tributes may be allowed with attribution.</Text>

            <Text style={styles.subHeading}>6. Trading & Auction Policies</Text>
            <Text style={styles.paragraph}><Text style={{ fontWeight: 'bold' }}>Fair Trading Rules:</Text> All trades are final unless proven fraudulent. Sellers must accurately describe listed items (e.g., rarity, condition).</Text>
            <Text style={styles.paragraph}><Text style={{ fontWeight: 'bold' }}>Auction Guidelines:</Text> ⏰ Bids are binding; failure to pay may result in penalties. 🛡️ MMB moderators review high-value auctions for fairness.</Text>
            <Text style={styles.paragraph}>Note: MMB charges a 5% transaction fee on successful auctions.</Text>

            <Text style={styles.subHeading}>7. Termination & Suspension</Text>
            <Text style={styles.paragraph}>
                MMB reserves the right to:
            </Text>
            <Text style={styles.listItem}>Suspend or terminate accounts violating these Terms.</Text>
            <Text style={styles.listItem}>Confiscate fraudulent assets without refund.</Text>
            <Text style={styles.listItem}>Ban users engaging in severe misconduct (e.g., scams, hate speech).</Text>
            <Text style={styles.paragraph}>Appeals: Users may contact support@mmb.com to dispute actions.</Text>

            <Text style={styles.subHeading}>8. Modifications to Terms</Text>
            <Text style={styles.paragraph}>
                MMB will notify users of material changes via email or in-app alerts.
                Continued use 30 days after updates constitutes acceptance.
                Historic versions of these Terms are archived here.
            </Text>

            <Text style={styles.subHeading}>9. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
                MMB is not responsible for:
            </Text>
            <Text style={styles.listItem}>Lost profits due to service interruptions.</Text>
            <Text style={styles.listItem}>User disputes over trades or auctions.</Text>
            <Text style={styles.listItem}>Third-party actions (e.g., payment processor errors).</Text>
            <Text style={styles.paragraph}>
                Maximum liability is limited to the amount spent by the user in the last 6 months.
            </Text>

            <Text style={styles.subHeading}>10. Governing Law</Text>
            <Text style={styles.paragraph}>
                These Terms are governed by the laws of Vietnam. Any disputes arising out of or in connection with these Terms shall be resolved exclusively by The competent Courts of Ho Chi Minh City.
            </Text>

            <Text style={styles.subHeading}>11. Contact Information</Text>
            <Text style={styles.paragraph}>
                For questions or disputes:
            </Text>
            <Text style={styles.listItem}>📧 Email: MMB@gmail.com</Text>
            <Text style={styles.listItem}>📌 Address: 7 D. D1, Long Thanh My, Thu Duc, Ho Chi Minh</Text>
            <Text style={styles.paragraph}>
                Response time: Within 7 business days.
            </Text>

            <Text style={styles.paragraph}>
                <Text style={{ fontWeight: 'bold' }}>Acknowledgment:</Text> By using MMB, you confirm that you have read, understood, and agreed to these Terms.
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
