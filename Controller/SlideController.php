<?php

namespace Kek\SliderBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class SlideController extends Controller
{
    /**
     * @Route("/slide")
     * @Template()
     */
    public function indexAction()
    {
        $class = $this->container->getParameter('kek_slider.slide.class');
        $repository = $this->getDoctrine()->getRepository($class);

        $slides = $repository->findBy([
            'published' => true,
        ], [
            'position' => 'ASC',
        ]);

        return [
            'slides' => $slides,
        ];
    }
}
