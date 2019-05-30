import React, {Component} from "react";


export default class OperatorWidget extends Component {

    render() {
        const {operator, toggleOperator} = this.props;
        return (
            <span className="flex flex-column justify-center">
                <span 
                    className="cursor-pointer text-underline text-medium 
                    text-bold text-uppercase text-purple-hover text-smaller"
                    onClick={toggleOperator}
                >
                    {operator}
                </span>
            </span>
        );
    }
}