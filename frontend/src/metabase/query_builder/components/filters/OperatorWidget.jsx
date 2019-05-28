import React, {Component} from "react";


export default class OperatorWidget extends Component {

    render() {
        const {operator, toggleOperator} = this.props;
        return (
            <span className="flex flex-column justify-center">
                <span 
                    className="p1 bordered rounded cursor-pointer text-medium text-bold"
                    onClick={toggleOperator}
                >
                    {operator.toUpperCase()}
                </span>
            </span>
        );
    }
}