import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../../config/config.js';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Informacion = () => {
  const { idevent, idsport } = useParams();
  const [documentos, setDocumentos] = useState([]);

  useEffect(() => {
    const getDocumentosInfo = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/getdocumentospdf`, {
          idevent: Number(idevent),
          idsport: Number(idsport),
          tipo: 1
        });
        setDocumentos(response.data);
      } catch (error) {
        console.error("Error fetching datos", error);
      }
    };

    if (idevent && idsport) {
      getDocumentosInfo();
    }
  }, [idevent, idsport]);

  return (
    <div className="container mx-auto p-6 font-quickSand" style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#333', textAlign: 'center' }}>
        Información de Programaciones
      </h2>
      {documentos.length > 0 ? (
        documentos.map((doc) => (
          <div
            key={doc.iddoc}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9f9f9',
              padding: '12px 20px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{doc.title}</span>
            <button
              onClick={() => window.open(doc.path, '_blank')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#007BFF')}
            >
              Ver PDF
            </button>
          </div>
        ))
      ) : (
        <p style={{ fontSize: '16px', color: '#777', textAlign: 'center' }}>No hay documentos disponibles.</p>
      )}
    </div>
  );
};

export default Informacion;
