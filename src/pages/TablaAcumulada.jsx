// src/pages/TablaAcumulada.jsx
import React from 'react'
import Layout from './Layout'
import TablaAcumuladaSection from '../sections/TablaAcumuladaSection'

const TablaAcumulada = () => {
    return (
        <Layout>
            <div style={{ marginTop: "75px" }}>
                <TablaAcumuladaSection />
            </div>
        </Layout>
    )
}

export default TablaAcumulada;