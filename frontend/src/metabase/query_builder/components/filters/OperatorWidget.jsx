import React, {Component} from "react";


export default class OperatorWidget extends Component {

    render() {
        const {operator, toggleOperator} = this.props;
        return (
            <span className="flex flex-column justify-center">
                <span 
                    className="p1 cursor-pointer text-underline text-medium 
                    text-bold text-uppercase text-purple-hover"
                    onClick={toggleOperator}
                >
                    {operator}
                </span>
            </span>
        );
    }
}