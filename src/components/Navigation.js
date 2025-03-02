import { ethers } from 'ethers';

const Navigation = ({account, setAccount}) => {

    const connect = async () => {
        const accs = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const act = ethers.utils.getAddress(accs[0])
        setAccount(act)
    };

    return(

        <nav>
            <ul className='nav__links'>
                <li><a href="#">Buy</a></li>
                <li><a href="#">Sell</a></li>
                <li><a href="#">Rent</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={"gem.png"} alt="Logo" />
                <h1>Equiparket</h1>
            </div>

            {account ? (
                <button type="button" className='nav__connect'>
                    {account.slice(0, 6) + '...' + account.slice(38, 42)}
                </button>
            ) : (
                <button type="button" className='nav__connect' onClick={connect}>
                    Connect #0
                </button>
            )}

        </nav>

    );
};

export default Navigation;