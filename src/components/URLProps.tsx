import React, { useState } from 'react';
import { Endpoint } from '../constants/message_types';
import { sanitizeURL, highlightSearchQuery } from '../utils/defaultview_utils';
import { MODAL_NAMES, CSS_CLASSES, FILTER_CATEGORIES, ClassificationType, ClassificationMapping} from '../constants/defaultview_contants';
import { Modal } from './modals/modal';
import { ViewCodeModal } from './modals/viewcode';
import { SeeResponseModal } from './modals/seeResponse';


interface URLPropsProps {
  endpoint: Endpoint;
  searchQuery: string;
  selectedCategories: Record<string, boolean>;
}

export function URLProps({ endpoint, searchQuery, selectedCategories }: URLPropsProps) {
  const [openModal, setOpenModal] = useState<keyof typeof MODAL_NAMES | null>(null);

  const closeModal = () => setOpenModal(null);

  const renderModalContent = () => {
    switch (openModal) {
      case MODAL_NAMES.viewCode:
        return <ViewCodeModal endpoint={endpoint} onClose={closeModal} />;
      case MODAL_NAMES.seeResponse:
        return <SeeResponseModal endpoint={endpoint} onClose={closeModal} />;
      default:
        return null;
    }
  };

  const getVisibleClassifications = (): ClassificationType[] => {
    if (!endpoint.classifications) return [];

    return Object.entries(endpoint.classifications)
      .filter(([_, value]) => value === true)
      .map(([key]) => ClassificationMapping[key])
      .filter((category): category is ClassificationType => 
        category !== undefined && selectedCategories[category]
      );
  };

  return (
    <tr>
      <td className="break-words max-w-lg">
        {highlightSearchQuery(endpoint.url, searchQuery)}
        <div className="mt-2 flex flex-wrap gap-1">
          {getVisibleClassifications().map(category => (
            <span key={category} className={CSS_CLASSES[category]}>
              {category.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        <div className="flex mt-2 items-center gap-1">
          <button className="i-button" onClick={() => setOpenModal(MODAL_NAMES.viewCode)}>
            <svg className="cursor-pointer hover:opacity-80" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="#3da28f" d="m8 18l-6-6l6-6l1.425 1.425l-4.6 4.6L9.4 16.6zm8 0l-1.425-1.425l4.6-4.6L14.6 7.4L16 6l6 6z"/>
              <title>View Code Snippet</title>
            </svg>
          </button>
          <button className="i-button" onClick={() => setOpenModal(MODAL_NAMES.seeResponse)}>
            <svg className="cursor-pointer hover:opacity-80" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="#3da28f" d="M20 4H6c-1.103 0-2 .897-2 2v5h2V8l6.4 4.8a1 1 0 0 0 1.2 0L20 8v9h-8v2h8c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2m-7 6.75L6.666 6h12.668z"/>
              <path fill="#3da28f" d="M2 12h7v2H2zm2 3h6v2H4zm3 3h4v2H7z"/>
              <title>See Request/Response</title>
            </svg>
          </button>
        </div>
        <Modal isOpen={openModal !== null} onClose={closeModal}>
          {renderModalContent()}
        </Modal>
      </td>
      <td className="break-words max-w-lg">{endpoint.foundAt}</td>
      <td className="break-words max-w-lg text-center">{endpoint.webpage}</td>
    </tr>
  );
}