import { useEffect, useState } from 'react';
import { ethers } from 'ethers'; //ehters是用于区块链交互的js独立三方库,安装hardhat时会依赖

function App()
{
    const loadBlockchain = async() => {
        //window是来自浏览器的接口 window.ethereum是浏览器中的区块链钱包 之所以能访问到是在浏览器中安装metamask时预设的
        //provider是ethers库提供的和区块链交互的操作对象
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log(accounts);
    }

    //当关注项传入[]空时意味着仅在组件挂在时调用,类似unity Monobehaviour的Start
    useEffect( () => {
        loadBlockchain();

        //返回函数是销毁时的调用函数
        return () => {};
    }, []);

    return (
        <div>
            <div>
                <h3>Welcome</h3>
            </div>  
        </div>
    );
}

export default App;