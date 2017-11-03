<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Delivery;
use AppBundle\Entity\Order;
use AppBundle\Entity\Restaurant;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

trait AdminTrait
{
    protected function restaurantOrders($id, array $routes = [], $tab = null)
    {
        $restaurantRepo = $this->getDoctrine()->getRepository(Restaurant::class);
        $orderRepo = $this->getDoctrine()->getRepository(Order::class);

        $restaurant = $restaurantRepo->find($id);

        $this->checkAccess($restaurant);

        $date = null;
        if ($tab && in_array($tab, ['today', 'tomorrow'])) {
            $date = new \DateTime($tab);
        }

        $orders = $orderRepo->getWaitingOrdersForRestaurant($restaurant);
        $history = $orderRepo->getHistoryOrdersForRestaurant($restaurant);

        $ordersJson = [];
        foreach ($orders as $order) {
            $ordersJson[] = $this->get('serializer')->serialize($order, 'jsonld', ['groups' => ['order']]);
        }

        return [
            'restaurant' => $restaurant,
            'restaurant_json' => $this->get('serializer')->serialize($restaurant, 'jsonld'),
            'history' => $history,
            'orders' => $orders,
            'orders_json' => '[' . implode(',', $ordersJson) . ']', // FIXME This is ugly...
            'restaurants_route' => $routes['restaurants'],
            'restaurant_route' => $routes['restaurant'],
            'routes' => $routes,
            'tab' => $tab
        ];
    }

    protected function acceptOrder($id, $route, array $params = [])
    {
        $order = $this->getDoctrine()->getRepository(Order::class)->find($id);
        $this->checkAccess($order->getRestaurant());

        $this->get('order.manager')->accept($order);
        $this->getDoctrine()->getManagerForClass(Order::class)->flush();

        return $this->redirectToRoute($route, $params);
    }

    protected function refuseOrder($id, $route, array $params = [])
    {
        $order = $this->getDoctrine()->getRepository(Order::class)->find($id);

        $this->checkAccess($order->getRestaurant());

        $order->setStatus(Order::STATUS_REFUSED);
        $this->getDoctrine()->getManagerForClass(Order::class)->flush();

        return $this->redirectToRoute($route, $params);
    }

    protected function readyOrder($id, $route, array $params = [])
    {
        $order = $this->getDoctrine()->getRepository(Order::class)->find($id);

        $this->checkAccess($order->getRestaurant());

        $order->setStatus(Order::STATUS_READY);
        $this->getDoctrine()->getManagerForClass(Order::class)->flush();

        return $this->redirectToRoute($route, $params);
    }

    protected function cancelOrder($id, $route, array $params = [])
    {
        $order = $this->getDoctrine()->getRepository(Order::class)->find($id);

        $this->checkAccess($order->getRestaurant());

        $order->setStatus(Order::STATUS_CANCELED);
        $order->getDelivery()->setStatus(Order::STATUS_CANCELED);

        $this->getDoctrine()->getManagerForClass(Order::class)->flush();
        $this->getDoctrine()->getManagerForClass(Delivery::class)->flush();

        $this->get('snc_redis.default')->lrem('deliveries:waiting', 0, $order->getDelivery()->getId());

        return $this->redirectToRoute($route, $params);
    }
}
