/**
 * Created by ggoma on 12/23/16.
 */
import React, {Component} from 'react';
import {
    Animated,
    PanResponder,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar
} from 'react-native';

import D from './dimensions';

import CoverFlow from './coverflow';
import {Ionicons} from '@exponent/vector-icons';

export const FOOTER_HEIGHT = 48;
export const TABBAR_HEIGHT = 56;
export const TOGETHER = FOOTER_HEIGHT + TABBAR_HEIGHT;

export default class Footer extends Component {
    state = {
        pan: new Animated.ValueXY(),
        opacity: new Animated.Value(1)

    };

    moving = false;
    open = false;
    hiding = false;
    offY = 0;


    componentDidMount() {
        setTimeout(() => this.measureView(), 0);
    }

    measureView() {
        this.refs.view.measure((a, b, w, h, px, py) => {
            this.offY = py;
        })
    }

    hideTabBarNavigation(dy) {
        let value = (this.offY + dy) % (D.height - TOGETHER);
        if(value < 0 ) {
            value = 0;
        }


        this.props.hideTabBarNavigation(value);
        // console.log(value);
    }

    componentWillMount() {
        let panMover = Animated.event([null,{
            dy : this.state.pan.y,
        }]);
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponderCapture: () => false,

            onPanResponderGrant: (e, gestureState) => {
            },

            onPanResponderMove: (e, g) => {



                if(this.moving || (!this.open && g.dy > 0) || (this.open && g.dy < 0)) {
                    // console.log('shouldnt move!!');
                    return
                }
                if((!this.open && g.dy < -5) || (this.open && g.dy > 5)) {
                    this.hideTabBarNavigation(g.dy);
                }

                if(!this.open && g.dy < -1) {
                    this.state.opacity.setValue(g.dy/70 + 1);
                }

                if(this.open && g.dy > 5) {
                    this.state.opacity.setValue(g.dy / 250 - 1);
                }


                return panMover(e,g);
            },
            onPanResponderRelease: (e, g) => {
                if(this.moving || (!this.open && g.dy > 0) || (this.open && g.dy < 0)) {
                    // console.log('shouldnt release');
                    return
                } else {
                    const offsetY = g.dy;
                    // console.log(offsetY);

                    if(!this.open) {
                        this.openPlaying(offsetY);
                    } else {
                       this.closePlaying(offsetY);
                    }
                }

            },

        });
    }

    openPlaying(offsetY) {
        if (offsetY < -100) {
            console.log('open');
            this.moving = true;
            this.props.hide();
            StatusBar.setHidden(true, true);
            Animated.timing(
                this.state.pan.y,
                {
                    toValue: -D.height + TOGETHER,
                    duration: 200,
                }
            ).start(() => {
                console.log('opened');
                //hide tab bar

                setTimeout(() => {
                    this.open = true;
                    this.moving = false;
                }, 200);
                this.state.pan.setOffset({y: -D.height + TOGETHER});
                this.state.pan.setValue({y: 0});
            });
        } else {
            this.moving = true;
            this.reset();
            console.log('back to original state 1!', this.state.pan.y);
            this.props.show();
            Animated.timing(
                this.state.pan.y,
                {toValue: 0}
            ).start(() => {
                setTimeout(() => this.moving = false, 200);
                this.state.pan.setOffset({y: 0});
            });
        }
    }

    closePlaying(offsetY) {
        if(offsetY > 100) {
            console.log('closing');
            this.reset();
            this.moving = true;
            this.props.show();
            StatusBar.setHidden(false, true);
            Animated.timing(
                this.state.pan.y,
                {toValue: D.height - TOGETHER, duration: 200}
            ).start(() => {
                console.log('closed');
                setTimeout(() => {
                    this.open = false;
                    this.moving = false;
                }, 200);
                this.state.pan.setOffset({y: 0});
                this.state.pan.setValue({y: 0});
            });
        } else {
            this.moving = true;
            console.log('back to original state 2!');
            this.props.hide();
            Animated.timing(
                this.state.pan.y,
                {toValue: 0}
            ).start(() => {
                setTimeout(() => this.moving = false, 200);
                this.state.pan.setOffset({y: -D.height + TOGETHER});
            });
        }
    }

    componentWillUnmount() {
        this.state.pan.x.removeAllListeners();
        this.state.pan.y.removeAllListeners();
    }

    scrollUp() {
        Animated.spring(
            this.state.opacity,
            {toValue: 0}
        ).start();
        this.openPlaying(-101);
    }

    scrollDown() {
        Animated.spring(
            this.state.opacity,
            {toValue: 1}
        ).start();
        this.closePlaying(101);
    }

    reset() {
        Animated.spring(
            this.state.opacity,
            {toValue: 1}
        ).start();
    }


    getStyle() {
        return {transform: [{translateY: this.state.pan.y}]};
    }

    renderDefault() {
        const {opacity} = this.state;
        return (
            <Animated.View style={[styles.firstView, {opacity}]}>
                <TouchableOpacity onPress={() => this.scrollUp()} >
                    <Ionicons name='ios-arrow-up' color='#aeafb3' size={16}/>
                </TouchableOpacity>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={styles.title}>Awesome Title · <Text style={styles.author}>Artist ggomaeng</Text></Text>
                    <View style={{flexDirection: 'row'}}>
                        <Ionicons color={'#429962'} style={{marginRight: 8, paddingBottom: 10}} name='ios-volume-up' size={16}/><Text style={styles.music}>SUNG'S MACBOOK PRO</Text>
                    </View>
                </View>
                <View style={styles.pause}>
                    <Ionicons name='ios-pause' color='white' size={16}/>
                </View>
            </Animated.View>
        )
    }

    render() {
        return (
            <View
                ref='view' style={styles.container}>
                <StatusBar ref='status' animated={true} barStyle={'light-content'}/>

                <Animated.View
                    {...this._panResponder.panHandlers}
                    style={[styles.playing, this.getStyle()]}>

                    <CoverFlow scrollDown={() => this.scrollDown()}/>
                    {this.renderDefault()}
                </Animated.View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: D.width,
        top: D.height-TOGETHER
    },
    playing: {
        backgroundColor: 'rgba(0,0,0,.95)',
        height: D.height,
        paddingBottom: FOOTER_HEIGHT,
    },
    firstView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 26,
        position: 'absolute',
        top: 0,
        height: FOOTER_HEIGHT + 10,
        width: D.width,
        backgroundColor: '#222327',
        borderTopColor: '#3c3d41',
        borderTopWidth: 4,
    },
    pause: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white'
    },

    title: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600'
    },

    author: {
        fontWeight: '600',
        color: '#aeafb3',
        fontSize: 12
    },

    music: {
        fontWeight: '300',
        color: '#40bf7c',
        fontSize: 12
    }

})