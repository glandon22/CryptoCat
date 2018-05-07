import React from 'react';
import CoinListItem from './coin_list_item';
const CoinList = (props) => {
    const CoinListItems = props.coins.map((coin) => {
        return (
            <CoinListItem 
            key={coin[1]}
            coin={coin[0]}
            symbol={coin[1]}
            addCoin={props.addCoin}
            />
        );
    });

    return (
        <div className="col-lg-2">
          <div className="btn-group-vertical float-right" data-toggle="buttons">
            {CoinListItems}
          </div>  
      </div>
    );
}

export default CoinList;