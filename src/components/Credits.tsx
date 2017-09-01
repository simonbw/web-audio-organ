import React from "react";
import styles from '../../styles/Credits.css';

export default class Credits extends React.Component<any, { [open: string]: boolean }> {
    constructor(props, context) {
        super(props, context);
        this.state = {open: false};
    }

    toggleOpen(): void {
        this.setState({open: !this.state.open});
    }

    render() {
        return (
            <div className={styles.Credits} onClick={() => this.toggleOpen()}>
                {this.state.open ?
                    <p>
                        The impulse response used for the reverb is licensed under the
                        {' '}<a href="https://creativecommons.org/licenses/by-sa/3.0/legalcode">CC-SA 3.0</a>{' '}
                        and created by: <br/>
                        <a href="http://www.openairlib.net/auralizationdb/content/lady-chapel-st-albans-cathedral">www.openairlib.net</a><br/>
                        Audiolab, University of York<br/>
                        Marcin Gorzel<br/>
                        Gavin Kearney<br/>
                        Aglaia Foteinou<br/>
                        Sorrel Hoare<br/>
                        Simon Shelley<br/>
                    </p>
                    :
                    <p>Credits/Licenses</p>
                }
            </div>
        );
    }
};
