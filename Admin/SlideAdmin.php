<?php

namespace Kek\SliderBundle\Admin;

use Msi\AdminBundle\Admin\Admin;
use JMS\DiExtraBundle\Annotation as DI;
use Msi\AdminBundle\Grid\Grid;
use Symfony\Component\Form\FormBuilder;

/**
 * @DI\Service("kek_slider_slide_admin", parent="msi_admin.admin")
 * @DI\Tag("msi.admin")
 */
class SlideAdmin extends Admin
{
    public function configure()
    {
        $this->class = $this->container->getParameter('kek_slider.slide.class');
    }

    public function buildGrid(Grid $grid)
    {
        $grid
            ->add('published', 'boolean')
            ->add('image', 'image', [
                'translation' => true,
            ])
        ;
    }

    public function buildForm(FormBuilder $builder)
    {
    }

    public function buildTranslationForm(FormBuilder $builder)
    {
        $builder
            ->add('imageFile', 'file')
            ->add('url')
        ;
    }
}
