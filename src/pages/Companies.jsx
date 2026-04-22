// src/pages/Companies.jsx
import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import CompaniesSection from '../sections/CompaniesSection'
import API_BASE_URL from "../config/config.js";
import axios from 'axios';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/companies`);
                if (!cancelled) setCompanies(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching companies data:', err);
                if (!cancelled) setError('No se pudo cargar la lista de aliados.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; }
    }, []);

    return (
        <Layout>
            <CompaniesSection
                companies={companies}
                loading={loading}
                error={error}
            />
        </Layout>
    )
}

export default Companies;
