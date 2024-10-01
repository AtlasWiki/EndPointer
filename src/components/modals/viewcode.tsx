import React from 'react';
import { sanitizeURL } from '../../utils/defaultview_utils';
import { Endpoint } from '../../constants/message_types';

interface ViewCodeModalProps {
  endpoint: Endpoint;
  onClose: () => void;
}

export const ViewCodeModal: React.FC<ViewCodeModalProps> = ({ endpoint, onClose }) => (
  <div>
    <h2>View Code Snippet for {sanitizeURL(endpoint)}</h2>
    <p>Content for View Code modal.</p>
    <button onClick={onClose}>Close</button>
  </div>
);