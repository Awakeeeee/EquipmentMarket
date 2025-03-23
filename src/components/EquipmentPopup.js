import React, { useState, useEffect } from 'react';
import './EquipmentPopup.css';

const EquipmentPopup = ({ equipment, price, deposit, onClose, escrow, account, nftId }) => {
    const [userRole, setUserRole] = useState(null);
    const [seller, setSeller] = useState(null);
    const [inspector, setInspector] = useState(null);
    const [lender, setLender] = useState(null);
    const [buyer, setBuyer] = useState(null);

    useEffect(() => {
        const checkUserRole = async () => {
            if (!escrow || !account) return;

            try {
                // 获取合约中的角色地址
                const sellerAddr = await escrow.seller();
                const inspectorAddr = await escrow.inspector();
                const lenderAddr = await escrow.lender();
                
                // 获取当前NFT的买家地址
                const productInfo = await escrow.products(nftId);
                const buyerAddr = productInfo.buyer;

                setSeller(sellerAddr);
                setInspector(inspectorAddr);
                setLender(lenderAddr);
                setBuyer(buyerAddr);

                // 判断当前用户角色
                if (account.toLowerCase() === sellerAddr.toLowerCase()) {
                    setUserRole('seller');
                } else if (account.toLowerCase() === inspectorAddr.toLowerCase()) {
                    setUserRole('inspector');
                } else if (account.toLowerCase() === lenderAddr.toLowerCase()) {
                    setUserRole('lender');
                } else if (account.toLowerCase() === buyerAddr.toLowerCase()) {
                    setUserRole('buyer');
                } else {
                    setUserRole('none');
                }
            } catch (error) {
                console.error('Error checking user role:', error);
                setUserRole('none');
            }
        };

        checkUserRole();
    }, [escrow, account, nftId]);

    const handleButtonClick = () => {
        console.log(`Button clicked by ${userRole}`);
    };

    const renderButton = () => {
        if (!userRole || userRole === 'none') return null;

        return (
            <button 
                className={`action-button ${userRole}`}
                onClick={handleButtonClick}
            >
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Action
            </button>
        );
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="close-button" onClick={onClose}>×</button>
                <div className="equipment-details">
                    <div className="equipment-image">
                        <img src={equipment.image} alt={equipment.name} />
                    </div>
                    <div className="equipment-info">
                        <h2>{equipment.name}</h2>
                        <p className="description">{equipment.description}</p>
                        <div className="attributes">
                            {equipment.attributes && equipment.attributes.map((attr, index) => (
                                <div key={index} className="attribute">
                                    <span className="attribute-trait">{attr.trait_type}:</span>
                                    <span className="attribute-value">{attr.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="price-info">
                            <div className="price-item">
                                <span className="label">价格:</span>
                                <span className="value">{price} ETH</span>
                            </div>
                            <div className="price-item">
                                <span className="label">押金:</span>
                                <span className="value">{deposit} ETH</span>
                            </div>
                        </div>
                        {renderButton()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentPopup; 