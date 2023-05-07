import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ErrorModal({ errorMessage, onClose }) {
  const [show, setShow] = useState(true);
  const handleClose = () => {
    setShow(false);
    onClose();
  };
  return (
    <>
      <Modal show={show} onHide={handleClose} onExited={() => onClose()}>
        <Modal.Header closeButton>
          <Modal.Title>An Error has occurred:</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default ErrorModal;
