import { useEffect, useState } from 'react';
import { ethers } from 'ethers'; //ehters是用于区块链交互的js独立三方库,安装hardhat时会依赖
import Navigation from './components/Navigation.js';
import EquipmentPopup from './components/EquipmentPopup.js';

import Equipment from './abis/Equipment.json' //这个文件是hardhat编译后的XXX.json ABI中只提取abi数组部分的文件 用于创建Contract
import Escrow from './abis/Escrow.json'

function App()
{
    //useState理解成为函数式组件赋予状态的机制 写法类似c# property的get set
    const [provider, setProvider] = useState(null)
    const [account, setAccount] = useState(null)
    const [market, setMarket] = useState(null)
    const [escrow, setEscrow] = useState(null)
    const [equipments, setEquipments] = useState([]) //区块链上装备列表
    const [selectedEquipment, setSelectedEquipment] = useState(null)
    const [showPopup, setShowPopup] = useState(false)

    const loadBlockchain = async() => {
        //window是来自浏览器的接口 window.ethereum是浏览器中的区块链钱包 之所以能访问到是在浏览器中安装metamask时预设的
        //provider是ethers库提供的和区块链交互的操作对象
        
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)

        //应该是浏览器中钱包当前连接的区块链网络
        const network = provider.getNetwork()

        //创建js中的合约实例
        const market_address = "0x5fbdb2315678afecb367f032d93f642f64180aa3" //在区块链部署记录中查询
        const market_obj = new ethers.Contract(market_address, Equipment, provider);
        setMarket(market_obj)
        const supplies = await market_obj.TotalSupply()
        console.log(supplies.toString())

        const escrow_address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
        const escrow_obj = new ethers.Contract(escrow_address, Escrow, provider);
        setEscrow(escrow_obj)
        
        const equipments = []
        for(var i = 1; i <= supplies; ++i){
            const uri = await market_obj.tokenURI(i); //inherited method
            console.log(uri)
            const response = await fetch(uri); //javascript发起http请求的函数
            const meta = await response.json();
            equipments.push(meta);
        }
        setEquipments(equipments)
        console.log(equipments)

        //--- 注册账户变化事件
        window.ethereum.on('accountsChanged', async () => {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            //指的是你所连接的钱包中选中的账户
            const act_address = ethers.utils.getAddress(accounts[0])
            setAccount(act_address)
        })


    }

    const handleEquipmentClick = (equipment) => {
        setSelectedEquipment(equipment);
        setShowPopup(true);
    }

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedEquipment(null);
    }

    //当关注项传入[]空时意味着仅在组件挂在时调用,类似unity Monobehaviour的Start
    useEffect( () => {
        loadBlockchain();

        //返回函数是销毁时的调用函数
        return () => {};
    }, []);

    return (
        <div>

            <Navigation account={account} setAccount={setAccount}></Navigation>

            <div className='cards__section'>

                <h3>Equipments On Sale</h3>

                <hr />

                <div className='cards'>
                    {equipments.map((ep, index) => (
                        <div className='card' key={index} onClick={() => handleEquipmentClick(ep)}>
                            <div className='card__image'>
                                <img src={ep.image} alt="Equipment" />
                            </div>
                            <div className='card__info'>
                                <h4>{ep.attributes[0].value} ETH</h4>
                                <p>
                                    <strong>{ep.attributes[1].value}</strong> |
                                    <strong>{ep.attributes[2].value}</strong> |
                                    <strong>{ep.attributes[3].value}</strong>
                                </p>
                                <p>{ep.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
            </div>

            {showPopup && selectedEquipment && (
                <EquipmentPopup
                    equipment={selectedEquipment}
                    price={5}
                    deposit={10}
                    onClose={handleClosePopup}
                    escrow={escrow}
                    account={account}
                    nftId={1} // 这里暂时写死为1，因为deploy.js中只部署了一个NFT
                />
            )}

        </div>
    );
}

export default App;