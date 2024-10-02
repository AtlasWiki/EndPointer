import React from 'react';
import { sanitizeURL } from '../../utils/defaultview_utils';
import { Endpoint } from '../../constants/message_types';


interface GenerateReportModalProps {
  endpoint: Endpoint;
  onClose: () => void;
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({ endpoint, onClose }) => (
  <div>
    <h2>Generate Report for {sanitizeURL(endpoint)}</h2>
    <p>Content for Generate Report modal.</p>
    <button onClick={onClose}>Close</button>
  </div>
);