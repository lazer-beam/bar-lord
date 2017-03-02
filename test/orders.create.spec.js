const expect = require('chai').expect
const Promise = require('bluebird')

const app = require('../server/server.js')
const request = require('supertest')(app)
const Tab = require('../db/models/tabModel')
const Drink = require('../db/models/drinkModel')
const Liquor = require('../db/models/liquorModel')
const AddIn = require('../db/models/addInModel')
const Order = require('../db/models/orderModel')
const ordersUtil = require('../server/utilities/ordersUtil')

describe('Adding an Order: ', () => {
  let createdLines = []
  let mockTabId;

  beforeEach(() => {
    return Tab.create({ customerName: 'TestMan' })
      .then(tab => {
        createdLines.push(tab)
        mockTabId = tab.dataValues.id
      })
  })

  afterEach(() => Promise.each(createdLines, line => line.destroy())
    .then(() => {
      return Drink.findAll()
    }).then(drinks => {
      return Promise.all(drinks.map(drink => {
        return drink.destroy()
      }))
    }).then(() => {
      return Liquor.findAll()
    }).then(liquors => {
      return Promise.all(liquors.map(liquor => {
        return liquor.destroy()
      }))
    }).then(() => {
      return AddIn.findAll()
    }).then(addIns => {
      return Promise.all(addIns.map(addIn => {
        return addIn.destroy()
      }))
    }).then(() => {
      return Order.findAll()
    }).then(orders => {
      return Promise.all(orders.map(order => {
        return order.destroy()
      }))
    }))

  it('should add a beer order to a tab', () => {
    const mockBeerDrink = {
      type: 'beer',
      name: 'Blue Moon',
      price: 750
    }

    return Drink.create(mockBeerDrink)
      .then(() => ordersUtil.createOrder(mockBeerDrink.name, mockTabId))
      .then(createdOrder => {
        expect(createdOrder).to.be.ok
        expect(createdOrder.dataValues.id).to.be.a('number')
        expect(createdOrder.dataValues.drinkId).to.be.a('number')
        expect(createdOrder.dataValues.tabId).to.be.a('number')
        expect(createdOrder.dataValues.tabId).to.be.equal(mockTabId)
        return Drink.findOne({ where: { id: createdOrder.dataValues.drinkId } })
      }).then(({ dataValues }) => {
        expect(dataValues.type).to.be.equal(mockBeerDrink.type)
        expect(dataValues.name).to.be.equal(mockBeerDrink.name)
        expect(dataValues.price).to.be.equal(mockBeerDrink.price)
      })
  })

  it('should add a shot order to a tab', () => {
    const mockShotDrink = {
      type: 'shot',
      name: 'Jameson',
      price: 900
    }

    return Drink.create(mockShotDrink)
      .then(() => ordersUtil.createOrder(mockShotDrink.name, mockTabId))
      .then(createdOrder => {
        expect(createdOrder).to.be.ok
        expect(createdOrder.dataValues.id).to.be.a('number')
        expect(createdOrder.dataValues.drinkId).to.be.a('number')
        expect(createdOrder.dataValues.tabId).to.be.a('number')
        expect(createdOrder.dataValues.tabId).to.be.equal(mockTabId)
        return Drink.findOne({ where: { id: createdOrder.dataValues.drinkId } })
      }).then(({ dataValues }) => {
        expect(dataValues.type).to.be.equal(mockShotDrink.type)
        expect(dataValues.name).to.be.equal(mockShotDrink.name)
        expect(dataValues.price).to.be.equal(mockShotDrink.price)
      })
  })

  it('should add a cocktail order to a tab', () => {
    const mockCocktailDrink = {
      type: 'cocktail',
      name: 'Screwdriver',
      price: 1000
    }

    return Drink.create(mockCocktailDrink)
      .then(() => ordersUtil.createOrder(mockCocktailDrink.name, mockTabId))
      .then(createdOrder => {
        expect(createdOrder).to.be.ok
        expect(createdOrder.dataValues.id).to.be.a('number')
        expect(createdOrder.dataValues.drinkId).to.be.a('number')
        expect(createdOrder.dataValues.tabId).to.be.a('number')
        expect(createdOrder.dataValues.tabId).to.be.equal(mockTabId)
        return Drink.findOne({ where: { id: createdOrder.dataValues.drinkId } })
      }).then(({ dataValues }) => {
        expect(dataValues.type).to.be.equal(mockCocktailDrink.type)
        expect(dataValues.name).to.be.equal(mockCocktailDrink.name)
        expect(dataValues.price).to.be.equal(mockCocktailDrink.price)
      })
  })

  it('should add an order by a POST to /orders/addorder', () => {
    const mockBeerDrink = 'Blue Moon'

    return Drink.create({
      name: 'Blue Moon',
      type: 'beer',
      price: 750
    }).then(createdDrink => {
      return request
        .post('/orders/addorder')
        .send({
          drinkName: mockBeerDrink,
          tabId: mockTabId
        })
        .expect(200)
        .expect(res => {
          expect(res.text).to.include('Successfully created order')
          return Order.findAll()
            .then(orders => {
              orders.forEach(order => {
                expect(order.dataValues.tabId).to.be.equal(mockTabId)
                expect(order.dataValues.drinkId).to.be.equal(createdDrink.dataValues.id)
              })
            })
        })
    })
  })
})