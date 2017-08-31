import React from "react";

import styles from '../../styles/Instructions.css';

export default class Instructions extends React.Component<any, { [open: string]: boolean }> {
    constructor(props, context) {
        super(props, context);
        this.state = {open: false};
    }

    toggleOpen(): void {
        this.setState({open: !this.state.open});
    }

    render() {
        return (
            <div className={styles.Instructions} onClick={() => this.toggleOpen()}>
                {this.state.open ?
                    <p>
                        Digits 1-9 at the top of your keyboard enable and disable stops. <br/>
                        Keys on your home row are white keys. <br/>
                        Keys above your home row are black keys. <br/>
                        The furthest left key in your home row (A on a QWERTY keyboard) is an A. <br/>
                        <a href="https://github.com/simonbw/web-audio-organ">Github</a>
                    </p>
                    :
                    <p>Instructions</p>
                }
            </div>
        );
    }
};
