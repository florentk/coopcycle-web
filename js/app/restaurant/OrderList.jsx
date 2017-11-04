import React from 'react';
import OrderLabel from '../order/Label.jsx';
import _ from 'lodash';
import moment from 'moment';

class OrderList extends React.Component
{
  constructor(props) {
    super(props)
    this.state = {
      orders: props.orders,
      active: props.active
    }
  }

  setActive(order) {
    this.setState({ active: order })
  }

  addOrder(order) {

    console.log(order);

    let { orders } = this.state
    orders.push(order)

    this.setState({ orders })
  }

  renderOrders(date, orders) {
    return (
      <div key={ date }>
        <h3>{ moment(date).calendar().split(' ')[0] }</h3>
        { this.renderOrdersTable(orders) }
      </div>
    )
  }

  renderOrdersTable(orders) {
    return (
      <div>
        <table className="table table-hover">
          <tbody>
          { _.map(orders, (order) => this.renderOrderRow(order)) }
          </tbody>
        </table>
      </div>
    )
  }

  renderOrderRow(order) {

    let className = ''
    if (this.state.active && this.state.active['@id'] === order['@id']) {
      className = 'active'
    }

    return (
      <tr key={ order['@id'] } onClick={ () => this.props.onOrderClick(order) } style={{ cursor: 'pointer' }} className={ className }>
        <td>#{ order['@id'].replace('/api/orders/', '') }</td>
        <td><OrderLabel order={ order } /></td>
        <td><i className="fa fa-clock-o" aria-hidden="true"></i>  { moment(order.delivery.date).format('lll') }</td>
        <td>{ order.total } €</td>
        <td className="text-right">{ order.customer.username }</td>
      </tr>
    )
  }

  render() {

    const { orders } = this.state

    if (orders.length === 0) {
      return (
        <div className="alert alert-warning">{ this.props.i18n['No orders yet'] }</div>
      )
    }

    const deliveryDate = order => moment(order.delivery.date).format('YYYY-MM-DD')
    const ordersByDate = _.mapValues(_.groupBy(orders, deliveryDate), orders => {
      orders.sort((a, b) => {
        const dateA = moment(a.delivery.date);
        const dateB = moment(b.delivery.date);
        if (dateA === dateB) {
          return 0;
        }

        return dateA.isAfter(dateB) ? 1 : -1;
      });

      return orders
    })

    return (
      <div>
      { _.map(ordersByDate, (orders, date) => this.renderOrders(date, orders)) }
      </div>
    )
  }
}

module.exports = OrderList;
