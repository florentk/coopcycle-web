import React from 'react';
import OrderLabel from '../order/Label.jsx';
import _ from 'lodash';
import moment from 'moment';

moment.locale($('html').attr('lang'));

class OrderList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      order: null
    };
  }

  resolveOrderRoute(route) {
    const order = this.state.order;
    const id = order['@id'].replace('/api/orders/', '');

    return this.props.routes[route].replace('__ORDER_ID__', id)
  }

  resolveUserRoute(route) {
    const customer = this.state.order.customer;

    return this.props.routes[route].replace('__USERNAME__', customer.username)
  }

  renderWaitingButtons() {
    return (
      <div className="row">
        <div className="col-sm-6">
          <form method="post" action={ this.resolveOrderRoute('order_refuse') }>
            <button type="submit" className="btn btn-block btn-sm btn-danger">
              <i className="fa fa-ban" aria-hidden="true"></i>  Refuser
            </button>
          </form>
        </div>
        <div className="col-sm-6">
          <form method="post" action={ this.resolveOrderRoute('order_accept') }>
            <button type="submit" className="btn btn-block btn-sm btn-success">
              <i className="fa fa-check" aria-hidden="true"></i>  Accepter
            </button>
          </form>
        </div>
      </div>
    )
  }

  renderAcceptedButtons() {
    return (
      <div className="row">
        <div className="col-sm-6">
          <form method="post" action={ this.resolveOrderRoute('order_cancel') }>
            <button type="submit" className="btn btn-block btn-sm btn-danger">
              <i className="fa fa-ban" aria-hidden="true"></i>  Annuler
            </button>
          </form>
        </div>
        <div className="col-sm-6">
          <form method="post" action={ this.resolveOrderRoute('order_ready') }>
            <button type="submit" className="btn btn-block btn-sm btn-success">
              <i className="fa fa-check" aria-hidden="true"></i>  Prête !
            </button>
          </form>
        </div>
      </div>
    )
  }

  setOrder(order) {
    this.setState({ order })
  }

  renderOrderItems() {
    return (
      <table className="table table-condensed">
        <tbody>
          { this.state.order.orderedItem.map((item, key) =>
            <tr key={ key }>
              <td>{ item.quantity } x { item.name }</td>
              <td className="text-right">{ item.quantity * item.price } €</td>
            </tr>
          ) }
          <tr>
            <td><strong>Total</strong></td>
            <td className="text-right"><strong>{ this.state.order.total } €</strong></td>
          </tr>
        </tbody>
      </table>
    )
  }

  render() {

    const { order } = this.state

    if (!order) {
      return (
        <div className="alert alert-info">Click on an order to display details</div>
      )
    }

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Order #{ order['@id'].replace('/api/orders/', '') }</h3>
        </div>
        <div className="panel-body">
          <p>
            <span className="text-left"><OrderLabel order={ order } /></span>
            <strong className="pull-right text-success">
                { moment(order.delivery.date).format('lll') }  <i className="fa fa-clock-o" aria-hidden="true"></i>
            </strong>
          </p>
          { order.customer.telephone &&
          <p className="text-right">{ order.customer.telephone }  <i className="fa fa-phone" aria-hidden="true"></i></p> }
          <p className="text-right">
            <a href={ this.resolveUserRoute('user_details') }>
              { order.customer.username }  <i className="fa fa-user" aria-hidden="true"></i>
            </a>
          </p>
          <h4>Dishes</h4>
          { this.renderOrderItems() }
          <hr />
          { order.status === 'WAITING' && this.renderWaitingButtons() }
          { order.status === 'ACCEPTED' && this.renderAcceptedButtons() }
        </div>
      </div>
    )
  }
}

module.exports = OrderList;
