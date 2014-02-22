if ( typeof Object.create !== 'function' ) {
    Object.create = function( obj ) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function($, window, undefined) {
    "use strict";

    var KekSlider = {
        init: function(el, options) {
            var self = this;

            self.$el = $(el);
            self.$carousel = self.$el.find('ul.carousel');
            self.options = $.extend({}, $.fn.kekSlider.options, options);

            // if (typeof self.options.carouselLiDimension === 'undefined') {
            //     alert('KekSlider: the option carouselLiDimension must be set. You must calculate padding, margin and border.');
            //     return;
            // }

            if (self.options.axis === 'x') {
                self.options.carouselLiDimension = self.$carousel.children().first().outerWidth(true);
                self.carouselWrapDimension = self.$carousel.closest('div').width();
            } else {
                self.options.carouselLiDimension = self.$carousel.children().first().outerHeight(true);
                self.carouselWrapDimension = self.$carousel.closest('div').height();
            }

            if (!self.options.infinite) {
                self.i = 1;
            }

            self.interval = 0;
            self.carouselReady = true;
            self.count = self.$carousel.children('li').length;
            self.position = self.options.axis === 'x' ? 'left' : 'top';
            self.maxVisible = Math.ceil(self.carouselWrapDimension / self.options.carouselLiDimension);
            self.carouselCanSlide = self.count > self.maxVisible ? true : false;

            if (self.options.slider) {
                self.$slider = self.$el.find('ul.slider');
                self.sliderReady = true;
                self.sliderCanSlide = self.count > 1 ? true : false;
            }

            self.initMarkup();
            // start the carousel only when all images have loaded so we dont get a animation with no images
            $(window).on('load', function() {
                self.options.cycle && self.cycle();
            });
            self.listen();
        },

        initMarkup: function() {
            var self = this;

            if (self.options.slider) {
                self.$activeCarouselLi = self.$carousel
                    .children('li')
                    .first()
                    .addClass('active');

                self.$activeSliderLi = self.$slider
                    .children('li')
                    .first()
                    .addClass('active')
                    .css('z-index', 999)
                    .css('position', 'relative')
                ;

                $.each(self.$slider.children('li'), function(i, e) {
                    var $e = $(e);
                    // data-id use is to link carousel li to slider li
                    $e.attr('data-id', i);

                    // an absolute element is not automatically put top left
                    $e
                        .css('top', 1)
                        .css('left', 1)
                        // width 100% is needed for firefox
                        .css('width', '100%')
                    ;

                    if (i !== 0) {
                        $e
                            .css('z-index', 998)
                            .css('display', 'none')
                            .css('position', 'absolute')
                        ;
                        $e.find('.overlay').hide();
                    }
                });

                $.each(self.$carousel.children('li'), function(i, e) {
                    var $e = $(e);
                    $e.attr('data-id', i);
                });
            }

            // set ul dimension
            self.$carousel.css(self.options.axis === 'x' ? 'width' : 'height', self.options.carouselLiDimension * self.count);

            // set starting position of first slide
            if (self.options.infinite && self.carouselCanSlide) {
                self.$carousel.css(self.position, -self.options.carouselLiDimension);
                self.$carousel.children('li').last().insertBefore(self.$carousel.children('li').first());
            }
        },

        listen: function()
        {
            var self = this;

            self.$el.on('click', 'a.control', function(e) {
                e.preventDefault();
                self.pause();
                if (!self.ready()) return;
                var direction = $(this).data('direction') === 'next' ? 'next' : 'prev';
                if (self.carouselCanSlide) {
                    if (self.options.infinite) {
                        self.slideInfinitely(direction);
                    } else {
                        self.slide(direction);
                    }
                } else if (self.options.slider) {
                    self.show(direction);
                }
            });

            self.$el.on('click', 'a.play', function(e) {
                e.preventDefault();
                self.cycle();
            });

            self.$el.on('click', 'a.pause', function(e) {
                e.preventDefault();
                self.pause();
            });

            if (self.options.slider) {
                self.$carousel.children('li').on('click', function(e) {
                    e.preventDefault();
                    if (!self.ready()) return;
                    self.show($(this));
                });
            }

            if (self.options.cycle && self.options.pauseOnHover) {
                self.$el.on('mouseenter', function() {
                    self.pause();
                });
                self.$el.on('mouseleave', function() {
                    self.cycle();
                });
            }
        },

        pause: function() {
            var self = this;

            clearInterval(self.interval);
            self.interval = 0;
        },

        cycle: function() {
            var self = this;

            if (self.interval !== 0) {
                return;
            }

            if (self.carouselCanSlide) {
                self.interval = setInterval(function() {
                    if (self.ready()) {
                        if (self.options.infinite) {
                            self.slideInfinitely('next');
                        } else {
                            self.slide('next');
                        }
                    }
                }, self.options.pauseTime);
            } else if (self.options.slider && self.sliderCanSlide) {
                self.interval = setInterval(function() {
                    self.ready() && self.show('next');
                }, self.options.pauseTime);
            }
        },

        ready: function() {
            var self = this;

            if (self.options.slider) {
                return this.sliderReady && this.carouselReady;
            }

            return this.carouselReady;
        },

        slide: function(direction)
        {
            var self = this,
                properties = {};

            self.carouselReady = false;

            self.l = self.count - self.maxVisible + 1;
            if (self.l < 1) { self.l = 1; }

            if (direction === 'next') {
                if (self.i === self.l) {
                    properties[self.position] = 0;
                    self.i = 1;
                } else {
                    properties[self.position] = '-'+self.options.carouselLiDimension * self.i;
                    self.i++;
                }
            } else {
                if (self.i === 1) {
                    self.i = self.l;
                    properties[self.position] = '-'+self.options.carouselLiDimension * (self.l - 1);
                } else {
                    self.i--;
                    properties[self.position] = '-'+self.options.carouselLiDimension * (self.i - 1);
                }
            }

            self.$carousel.animate(properties, self.options.carouselSpeed, self.options.carouselEasing, function() {
                direction === 'next' ? self.options.afterNext() : self.options.afterPrev();
                self.options.slider ? self.show('next') : self.options.afterNext();
                self.carouselReady = true;
            });
        },

        slideInfinitely: function(direction)
        {
            var self = this,
                $first = self.$carousel.children('li').first(),
                $last = self.$carousel.children('li').last(),
                properties = {};

            self.carouselReady = false;

            if (direction === 'next') {
                properties[self.position] = '-'+self.options.carouselLiDimension * 2;
                self.$carousel.animate(properties, self.options.carouselSpeed, function() {
                    $first.insertAfter($last);
                    self.$carousel.css(self.position, -self.options.carouselLiDimension);
                    self.options.slider ? self.show('next') : self.options.afterNext();
                    self.carouselReady = true;
                });
            } else {
                properties[self.position] = 0;
                self.$carousel.animate(properties, self.options.carouselSpeed, function() {
                    $last.insertBefore($first);
                    self.$carousel.css(self.position, -self.options.carouselLiDimension);
                    self.options.slider ? self.show('prev') : self.options.afterPrev();
                    self.carouselReady = true;
                });
            }
        },

        show: function($carouselLi)
        {
            if ($carouselLi === 'next') {
                var direction = 'next';
                $carouselLi = this.$activeCarouselLi.next().length ? this.$activeCarouselLi.next() : this.$carousel.children('li').first();
            }

            if ($carouselLi === 'prev') {
                var direction = 'prev';
                $carouselLi = this.$activeCarouselLi.prev().length ? this.$activeCarouselLi.prev() : this.$carousel.children('li').last();
            }

            var self = this,
                id = $carouselLi.data('id'),
                $sliderLi = self.$slider.children('li[data-id='+id+']');

            if (self.$activeSliderLi.data('id') === id) {
                return;
            }

            self.sliderReady = false;

            // prepare next slide to become active
            $sliderLi
                .addClass('active')
                .css('z-index', 999)
            ;

            // prepare current slide to become hidden
            self.$activeSliderLi
                .removeClass('active')
                .css('z-index', 998)
            ;

            // fix carousel active li
            $carouselLi.addClass('active');
            self.$activeCarouselLi.removeClass('active');

            $sliderLi.effect(self.options.sliderEffect, self.options.sliderProperties, self.options.sliderSpeed, function() {
                // for optimization we should move all the css into a default slider css file and work with classes.

                // reason we can't just have one relative and the rest absolute at all time is that whenever we will hide the relative (need to hide it to then make it reappear) one our slide will lose its height

                // if we ever have a problem here, what we could do is rigth before set li height and wdith to image's height and width, do the position switch, then set the li height and width back to auto/100%.

                $sliderLi
                    .css('position', 'relative')
                ;

                self.$activeSliderLi
                    .css('display', 'none')
                    .css('position', 'absolute')
                ;
                self.$activeSliderLi.find('.overlay').hide();

                var callback = function() {
                    if (direction === 'next') {
                        self.options.afterNext();
                    } else if (direction === 'prev') {
                        self.options.afterPrev();
                    }
                    self.$activeSliderLi = $sliderLi;
                    self.$activeCarouselLi = $carouselLi;
                    self.sliderReady = true;
                };

                if ($sliderLi.find('.overlay').length) {
                    $sliderLi.find('.overlay').effect(
                        self.options.overlayEffect,
                        self.options.overlayProperties,
                        self.options.overlaySpeed,
                        callback
                    );
                } else {
                    callback();
                }
            });
        }
    };

    $.fn.kekSlider = function(options) {
        return this.each(function() {
            var kekSlider = Object.create(KekSlider);
            kekSlider.init(this, options);
        });
    };

    $.fn.kekSlider.options = {
        slider: true,
        infinite: true,
        cycle: true,
        pauseTime: 3000,
        pauseOnHover: true,
        axis: 'x',
        carouselSpeed: 400,
        carouselEasing: 'swing',
        sliderEffect: 'fade',
        sliderProperties: {mode: 'show', easing: 'swing'},
        sliderSpeed: 400,
        overlayEffect: 'slide',
        overlayProperties: {direction: 'left', mode: 'show', easing: 'swing'},
        overlaySpeed: 900,
        afterNext: function() {},
        afterPrev: function() {}
    };
})(jQuery, window);
