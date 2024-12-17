import React from 'react';
import { Check } from 'lucide-react';

export function BulletList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
          <span>
            {item.strong ? (
              <>
                <strong className="font-medium">{item.strong}</strong> {item.text}
              </>
            ) : (
              item.text
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}