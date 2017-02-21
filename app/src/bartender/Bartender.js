import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Label, Divider, Header } from 'semantic-ui-react'
import '../App.css'

import { actions } from './duck.Bartender'
import DrinkGroup from './BartenderDrinkGroup'
import CompletedDrinks from './BartenderCompletedDrinks'

@connect(store => ({
  visible: store.dash.visible,
  unfufilledOrders: store.bar.unfufilledOrders,
  fetchedOrders: store.bar.fetchedOrders,
  completingOrders: store.bar.completingOrders,
  donePickupOrders: store.bar.donePickupOrders,
  doneTableOrders: store.bar.doneTableOrders,
}))

class Bartender extends Component {
  constructor(props) {
    super(props)
    this.checkIfAllOrdersDone = ::this.checkIfAllOrdersDone
    this.completeTab = ::this.completeTab
  }

  componentDidMount() {
    if (!this.props.fetchedOrders) {
      this.props.dispatch(actions.fetchOrders())
    }
  }

  componentDidUpdate() {
    this.checkIfAllOrdersDone()
  }

  completeTab(ordersToComplete) {
    const tab = [ordersToComplete]

    ordersToComplete[0].tableNum === 0 ? this.props.dispatch(actions.setDonePickupOrders(tab)) : this.props.dispatch(actions.setDoneTableOrders(tab))

    this.props.dispatch(actions.resetRemainingTabs(this.props.unfufilledOrders.filter(currTab => currTab[0].id !== ordersToComplete[0].id)))
  }

  findAndRemove(tabId, id) {
    const newOrders = this.props.unfufilledOrders.map(tab => tab.map(order => {
      return order.id === id ? Object.assign(order, { complete: true }) : order
    }))

    this.props.dispatch(actions.resetOrders(newOrders))
  }

  checkIfAllOrdersDone() {
    const context = this
    this.props.unfufilledOrders.forEach(tab => {
      if (tab.filter(order => order.complete).length === tab.length) {
        context.completeTab(tab)
      }
    })
  }

  numOfOrders() {
    return this.props.unfufilledOrders.reduce((numOfOrders, currTab) => numOfOrders + currTab.filter(order => !order.complete).length, 0)
  }

  render() {
    const props = {
      removeDrink: ::this.findAndRemove,
      numOfOrders: ::this.numOfOrders,
    }

    return (
      <Grid>
        <Grid.Row>
          <CompletedDrinks completedTables={this.props.doneTableOrders} completedPickups={this.props.donePickupOrders} />
          <Grid.Column width={4} id="bar_queue_container" className="revealer">
            <Header as="h2">
              <Label className="testing" circular size="large" color="red">{props.numOfOrders()}</Label>
              <Header.Content>
                Bar Queue
              </Header.Content>
            </Header>
            <Divider />
            {this.props.unfufilledOrders.map(tab => <DrinkGroup {...props} key={tab[0].id} tab={tab} />)}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default Bartender
