import React from 'react'
 
function Loader({ color = "#28a745" }) {
    return (
        <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    )
}
 
export default Loader