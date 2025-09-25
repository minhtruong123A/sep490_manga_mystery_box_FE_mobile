// src/screens/HelpScreen.tsx

import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

export default function CopyrightPolicy() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Copyright Policy */}
            <Text style={[styles.heading, { marginTop: 32 }]}>Copyright Policy</Text>
            <Text style={styles.lastUpdated}>Last Updated: 30th July, 2025</Text>

            <Text style={styles.paragraph}>
                Manga Mystery Box ("MMB") respects intellectual property rights and expects all users to do the same. This Copyright Policy outlines the ownership, permitted uses, and infringement procedures for content on our platform.
            </Text>

            <Text style={styles.subHeading}>1. Ownership of Content</Text>
            <Text style={styles.paragraph}>Protected Materials</Text>
            <Text style={styles.listItem}>🎴 Digital Assets: Manga/anime-themed boxes and cards, character designs, and artwork</Text>
            <Text style={styles.listItem}>💻 Software & Code: Platform infrastructure, algorithms, and UI/UX elements</Text>
            <Text style={styles.listItem}>📝 Text Content: Descriptions, lore, and instructional materials</Text>

            <Text style={styles.paragraph}>Restrictions</Text>
            <Text style={styles.listItem}>🚫 Reproduce, modify, or create derivative works</Text>
            <Text style={styles.listItem}>🚫 Distribute content outside the MMB ecosystem</Text>
            <Text style={styles.listItem}>🚫 Use assets for commercial purposes (e.g., merchandise, third-party apps)</Text>
            <Text style={styles.paragraph}>Exception: Brief excerpts for reviews/news may qualify as fair use.</Text>

            <Text style={styles.subHeading}>2. User-Generated Content (UGC)</Text>
            <Text style={styles.paragraph}>
                License Grant
            </Text>
            <Text style={styles.listItem}>✅ Confirm ownership or legal right to share the material</Text>
            <Text style={styles.listItem}>📜 Grant MMB a non-exclusive, transferable, sub-licensable license to:</Text>
            <Text style={styles.listItem}>• Display UGC within the platform</Text>
            <Text style={styles.listItem}>• Use for promotional materials</Text>
            <Text style={styles.listItem}>• Adapt for technical requirements (e.g., formatting)</Text>

            <Text style={styles.paragraph}>Prohibited UGC</Text>
            <Text style={styles.listItem}>⚠️ Third-party copyrighted material without permission</Text>
            <Text style={styles.listItem}>⚠️ Trademarked logos/branding</Text>
            <Text style={styles.listItem}>⚠️ AI-generated art violating source artist rights</Text>

            <Text style={styles.subHeading}>3. Copyright Infringement Reports</Text>
            <Text style={styles.paragraph}>DMCA Compliance</Text>
            <Text style={styles.paragraph}>
                To report infringement, send a notice to MMB@gmail.com with:
            </Text>
            <Text style={styles.listItem}>1-Identification</Text>
            <Text style={styles.listItem}>Description of copyrighted work</Text>
            <Text style={styles.listItem}>URL(s) of infringing material</Text>
            <Text style={styles.listItem}>2-Contact Information</Text>
            <Text style={styles.listItem}>Full legal name</Text>
            <Text style={styles.listItem}>Address, phone, email</Text>
            <Text style={styles.listItem}>3-Legal Declarations</Text>
            <Text style={styles.listItem}>Statement of good faith belief</Text>
            <Text style={styles.listItem}>Verification under penalty of perjury</Text>

            <Text style={styles.subHeading}>4. Enforcement Actions</Text>
            <Text style={styles.paragraph}>
                MMB reserves the right to:
            </Text>
            <Text style={styles.listItem}>🔨 Immediate Removal of infringing content</Text>
            <Text style={styles.listItem}>📛 Account Suspension for repeat offenders</Text>
            <Text style={styles.listItem}>⚖️ Legal Referral for severe violations</Text>
            <Text style={styles.paragraph}>Appeals: Submit within 30 days to MMB@gmail.com.</Text>

            <Text style={styles.subHeading}>5. Platform-Specific Rules</Text>
            <Text style={styles.paragraph}>
                Digital Collectibles
            </Text>
            <Text style={styles.listItem}>Cards purchased grant limited in-platform usage rights only</Text>
            <Text style={styles.listItem}>Resale must occur through MMB-approved markets</Text>
            <Text style={styles.paragraph}>Fan Art must be original creations (no traced/copied artwork) and tag original creators when possible.</Text>

            <Text style={styles.subHeading}>6. Global Compliance</Text>
            <Text style={styles.paragraph}>
                MMB adheres to:
            </Text>
            <Text style={styles.listItem}>🌐 DMCA (US)</Text>
            <Text style={styles.listItem}>📜 EU Copyright Directive</Text>
            <Text style={styles.listItem}>🎴 Japan's Copyright Act for manga-derived content</Text>
            <Text style={styles.paragraph}>International takedown requests will be processed within 10 business days.</Text>

            <Text style={styles.subHeading}>7. Policy Updates</Text>
            <Text style={styles.paragraph}>
                We will:
            </Text>
            <Text style={styles.listItem}>📢 Notify users of changes via email/platform alerts</Text>
            <Text style={styles.listItem}>🗂 Maintain version history here</Text>
            <Text style={styles.paragraph}>Continued use constitutes acceptance.</Text>

            <Text style={styles.subHeading}>Contact</Text>
            <Text style={styles.paragraph}>
                For copyright matters:
            </Text>
            <Text style={styles.listItem}>📧 Email: MMB@gmail.com</Text>
            <Text style={styles.listItem}>📌 Address: 7 D. D1, Long Thanh My, Thu Duc, Ho Chi Minh</Text>
            <Text style={styles.paragraph}>Response time: 5-7 business days</Text>

            <Text style={styles.paragraph}>
                <Text style={{ fontWeight: 'bold' }}>Acknowledgment:</Text> By using MMB, you confirm understanding of this policy and agree to comply with all applicable copyright laws.
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
