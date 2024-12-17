import React from 'react';
import { Mail, Shield, UserCheck, Database } from 'lucide-react';
import { LegalSection } from './legalSection';
import { BulletList } from './bulletList';

export function PrivacyContent() {
  return (
    <div className="prose prose-sm max-w-none">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900 m-0">Privacy Policy</h2>
      </div>

      <LegalSection title="Information We Collect">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              Personal Information
            </h4>
            <BulletList
              items={[
                { text: "Name and email address" },
                { text: "Contact information" },
                { text: "Account details" }
              ]}
            />
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              Usage Data
            </h4>
            <BulletList
              items={[
                { text: "Browser information" },
                { text: "Device details" },
                { text: "Usage statistics" }
              ]}
            />
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Contact Us">
        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
          <Mail className="w-5 h-5 text-blue-500" />
          <p className="m-0">
            For privacy inquiries, email us at{' '}
            <a href="mailto:empowerpwd@gmail.com" className="text-blue-600 hover:text-blue-800 font-medium">
             empowerpwd@gmail.com
            </a>
          </p>
        </div>
      </LegalSection>
    </div>
  );
}