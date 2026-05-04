import React from 'react'

export default function PageHeader({
    title = ''
}) {
    return (
        <div style={{ background: "#1a2a5e", padding: "12px 24px", color: "#fff", fontWeight: 600 }}>Namankit School Onboarding -  {title}</div>
    )
}
