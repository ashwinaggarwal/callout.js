describe("CalloutJs", function() {
	var Callout,
        expect = chai.expect;

    var fixture = {
        get el() {
            return $(this.selector);
        },
        selector : '#fixtures'
    };

    var list = {
        get el() {
            return  '<ul class="items">'+
                        '<li id="item1">Page1</li>'+
                        '<li id="item2">Page2</li>'+
                        '<li id="item3">Page3</li>'+
                    '</ul>';
        }
    }

    before(function(){
        this.$fixtures = fixture.el;
    });

	beforeEach(function() {
        this.$fixtures.append(list.el);

        Callout = callout({
            steps: [{
                element: document.getElementById('item1'),
                intro: 'I came across this job opportunity o​n fronteers. Please consider this email as my application for Front End Engineer role. Below is a brief about me',
                introShort: 'Item 1',
                position: "right",
                prepareView : function(){
                    console.log('Item 1 prepare view');
                }
            },{
                element: document.getElementById('item2'),
                intro: 'Item 2',
                introShort: 'Item 2',
                position: "right",
                prepareView : function(){
                    console.log('Item 2 prepare view');
                }
            },{
                element: document.getElementById('item3'),
                intro: 'Item 3',
                introShort: 'Item 3',
                position: "right"
            }],
            events : {
                beforestart : function() {
                    console.log('Before start handler');
                },
                complete : function() {
                    console.log('Complete handler');
                },
                exit : function() {
                    console.log('Exit handler');
                }
            }
        });
		
	});

	describe("start", function() {
		it("should fire beforestart", function() {
			var spy = sinon.spy(Callout, '_fireEvent');
			Callout.start();
            Callout.exit();
			expect(spy).to.have.been.calledWith("beforestart");
		});
        it("should call beforestart handler", function() {
            var spy = sinon.spy(Callout._options.events, 'beforestart');
            Callout.start();
            Callout.exit();
            expect(spy).to.have.been.called;
        });
        it("should be on first step", function() {
            Callout.start();
            var currentStep = Callout.step();
            Callout._introJs.exit();
            expect(currentStep).to.equal(0);
        });
    });
    describe("step", function(){
        it("should be second on click of next", function() {
            Callout.start();
            $('.introjs-nextbutton').trigger('click');
            var currentStep = Callout.step();
            Callout.exit();
            expect(currentStep).to.equal(1);
        });
        it("should launch the correct step when step number is passed", function() {
            Callout.start();
            Callout.step(2);
            var currentStep = Callout.step();
            Callout.exit();
            expect(currentStep).to.equal(2);
        });
        it("should be undefined after all steps are perfomed", function() {
            Callout.start();
            $('.introjs-nextbutton').trigger('click');
            $('.introjs-nextbutton').trigger('click');
            $('.introjs-skipbutton').trigger('click');
            var currentStep = Callout.step();
            expect(currentStep).to.be.undefined;
        });
	});
    describe("exit", function(){
        it("should call the introJs exit", function() {
            var spy = sinon.spy(Callout._introJs, 'exit');
            Callout.start();
            Callout.exit();
            expect(spy).to.have.been.called;
        });
        it("should fire exit", function() {
            var spy = sinon.spy(Callout, '_fireEvent');
            Callout.start();
            Callout.exit();
            expect(spy).to.have.been.calledWith('exit');
        });
        it("should call exit handler", function() {
            var spy = sinon.spy(Callout._options.events, 'exit');
            Callout.start();
            Callout.exit();
            expect(spy).to.have.been.called;
        });
        it("should not call complete handler", function() {
            var spy = sinon.spy(Callout, '_fireEvent');
            Callout.start();
            Callout.exit();
            expect(spy.neverCalledWith('complete')).to.be.ok;
        });
    });

    describe("_prepareView", function(){
        it("should be called for each step", function(){
            var spy = sinon.spy(Callout, '_prepareView');
            Callout.start();
            $('.introjs-nextbutton').trigger('click');
            $('.introjs-nextbutton').trigger('click');
            Callout.exit();
            expect(spy).to.have.been.calledTrice;
        });
        it("should warn when prepareView is not present", function(){
            var spy = sinon.spy(console, 'warn');
            Callout.start();
            $('.introjs-nextbutton').trigger('click');
            $('.introjs-nextbutton').trigger('click');
            $('.introjs-skipbutton').trigger('click');
           	expect(spy).to.have.been.calledWith("prepare view is undefined for 2");
        });
    });

    describe("complete", function(){
        it("should fire complete", function(){
            var spy = sinon.spy(Callout, '_fireEvent');
            Callout.start();
            $('.introjs-nextbutton').trigger('click');
            $('.introjs-nextbutton').trigger('click');
            $('.introjs-skipbutton').trigger('click');
            expect(spy).to.have.been.calledWith('complete');
        });
        it("should call complete handler", function(){
            var spy = sinon.spy(Callout._options.events, 'complete');
            Callout.start();
            $('.introjs-nextbutton').trigger('click');
            $('.introjs-nextbutton').trigger('click');
            $('.introjs-skipbutton').trigger('click');
           expect(spy).to.have.been.called;
        });
    });

    afterEach(function(){
        this.$fixtures.empty();
    });

    after(function(){
        this.$fixtures = null;
    })
});
