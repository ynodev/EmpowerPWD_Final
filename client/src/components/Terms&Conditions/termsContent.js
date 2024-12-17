import React from 'react';
import { ScrollText, UserCheck, Shield, Mail } from 'lucide-react';
import { LegalSection } from './legalSection';
import { BulletList } from './bulletList';

export function TermsContent() {
  return (
    <div className="prose prose-sm max-w-none">
      <div className="flex items-center gap-3 mb-8">
        <ScrollText className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 m-0">Terms of Service</h2>
      </div>

      <LegalSection title="User Agreement">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              User Responsibilities
            </h4>
            <BulletList
              items={[
                { text: "Provide accurate information" },
                { text: "Maintain account security" },
                { text: "Follow community guidelines" }
              ]}
            />
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Our Commitments
            </h4>
            <BulletList
              items={[
                { text: "Protect your privacy" },
                { text: "Maintain service quality" },
                { text: "Provide support" }
              ]}
            />
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Contact">
        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
          <Mail className="w-5 h-5 text-blue-500" />
          <p className="m-0">
            For questions about these Terms, email us at{' '}
            <a href="mailto:empowerpwd@gmail.com" className="text-blue-600 hover:text-blue-800 font-medium">
                empowerpwd@gmail.com
            </a>
          </p>
        </div>
      </LegalSection>
    </div>
  );
}