import * as React from 'react';
import { connect} from 'react-redux';
import { Redirect } from 'react-router-dom';
import { RECEIVE_ATTACK } from '../store';
import './index.css';

// Levels > Res > States??
const characters = {
  level3: {
    high: {
      idle: {
        color1: '/assets/characters/wizard_3/wizard-level3-color1-idle-high.png',
        color2: '/assets/characters/wizard_3/wizard-level3-color2-idle-high.png'
      },
      attack: {
        color1: '/assets/characters/wizard_3/wizard-level3-color1-attack-high.png',
        color2: '/assets/characters/wizard_3/wizard-level3-color2-attack-high.png'
      },
      hit: {
        color1: '/assets/characters/wizard_3/wizard-level3-color1-hit-high.png',
        color2: '/assets/characters/wizard_3/wizard-level3-color2-hit-high.png'
      }
    }
  }
}

const buttons = {
  broomstick: '/assets/weapons/weapon-broomstick-button.png',
  stick: '/assets/weapons/weapon-stick-button.png',
}
const weapons = {
  staff: {
    high: '/assets/weapons/weapon-staff-high.png'
  },
  stick: {
    high: '/assets/weapons/weapon-stick-high.png'
  }
}
const icons = {
  heart: {
    high: '/assets/icons/icon-heart-high.png',
    med: '/assets/icons/icon-heart-med.png',
    medlo: '/assets/icons/icon-heart-medlo.png',
    lo: '/assets/icons/icon-heart-lo.png'
  },
  coin: {
    high: '/assets/icons/icon-coin-high.png',
    med: '/assets/icons/icon-coin-med.png',
    medlo: '/assets/icons/icon-coin-high.png',
    lo: '/assets/icons/icon-coin-lo.png'
  }
}

type State = {
  money: number,
  health: number,
  income: number
}

class GameScreen extends React.Component<Props, State> {

  componentDidMount() {
    // uncomment when done working with characters and ui
    // if( this.props.socket === null ) return;

    // this.props.socket.addEventListener('message', function(data) {
    //   switch(data.op) {
    //     case 'RECEIVE_ATTACK':
    //       // trigger animation
    //       this.setState({
    //         health: data.health
    //       });
    //       break;
    //   }
    // });
  }

  state = {
    money: this.props.money,
    health: this.props.health,
    income: this.props.income
  }

  attack = () => {
    this.props.socket.send(JSON.stringify({ op: 'ATTACK' }));
  }

  render() {
    // uncomment when done working with characters and ui
    // if(this.props.socket === null) return <Redirect to='/' />;

    let weaponCost = 200; //remove this when implemented

    return (
      <div className="game-screen screen">
        <div className="players">
          <div className="health-container">
            <div className="player-1">
              <img className="icon-heart icon" src={ icons.heart.high } alt="icon-heart"/>
              <p className="health player1-health">{ this.state.health }</p>
              <p>{ this.props.playerNumber === 1 ? 'You' : ''}</p>
            </div>
            <div className="player-2">
              <img className="icon-heart icon" src={ icons.heart.high } alt="icon-heart"/>
              <p className="health player2-health">{ this.state.health }</p>
              <p>{ this.props.playerNumber === 2 ? 'You' : ''}</p>
            </div>
          </div>
          <div className="player player-1">
            <img src={ characters.level3.high.idle.color1 } alt="player"/>
          </div>
          <div className="player player-2">
            <img src={ characters.level3.high.idle.color2 } alt="player"/>
          </div>
        </div>
        <div className="game-ui">
          <div className="money">
            <img className="icon-coin icon" src={ icons.coin.high } alt="icon-coin"/>
            <p>{ this.state.money } <span>+3.13/s</span></p>
          </div>
          <div className="weapons">
            <div className={ this.state.money < weaponCost ? 'weapon disabled' : 'weapon' }>
              <div className="weapon-image">
                <img src={ buttons.stick } alt="weapon"/>
              </div>
              <div className="weapon-cost">
                <img className="icon-coin icon" src={ icons.coin.high } alt="icon-coin"/>
                <p>200</p>
              </div>
            </div>
            <div className={ this.state.money < weaponCost ? 'weapon disabled' : 'weapon' }>
              <div className="weapon-image">
                <img src={ buttons.broomstick } alt="weapon"/>
              </div>
              <div className="weapon-cost">
                <img className="icon-coin icon" src={ icons.coin.high } alt="icon-coin"/>
                <p>200</p>
              </div>
            </div>
          </div>
          <button className="attack-button" type="button attack-button" onClick={ this.attack }>Attack</button>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
   receive_attack: health => {
      dispatch({ type: RECEIVE_ATTACK, health });
    }
  };
};

const mapStateToProps = (state) => state;
const ConnectedGameScreen = connect(mapStateToProps, mapDispatchToProps)(GameScreen);
export default ConnectedGameScreen;
